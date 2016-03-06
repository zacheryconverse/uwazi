import React, { Component, PropTypes } from 'react'
import wrap from 'wrap-range-text'
import ReferenceForm from './ReferenceForm'
import TextRange from 'batarange'
import { browserHistory } from 'react-router'
import api from '../../utils/singleton_api'
import './scss/document.scss'

class Document extends Component {

  constructor (props) {
    super(props);
    this.state = {};
  }

  unwrapFakeSelection = () => {
    if(this.fakeSelection){
      this.fakeSelection.unwrap();
    }
  }

  //
  handleClick = (e) => {

    let ref = e.target.getAttribute('ref');
    if(ref){
      let reference = this.props.references.find(reference => reference.value._id == ref);
      browserHistory.push('/document/'+reference.value.targetDocument);
    }

  }
  //

  textSelectionHandler = () => {
    this.unwrapFakeSelection();

    if(window.getSelection().toString() === ''){
      this.closeModal();
      return this.setState({textIsSelected: false});
    }

    this.onTextSelected();
  }

  onTextSelected = () => {
    let range = window.getSelection().getRangeAt(0);
    this.serializedRange = TextRange.serialize(range, this.contentContainer);
    this.simulateSelection(range);
    this.setState({textIsSelected: true});
  }

  createReference = () => {
    this.props.onCreateReference(this.reference);
  }

  createPartSelection = () => {
    this.setState({targetDocument: undefined, textIsSelected: false});
    this.referencesAlreadyRendered = false;

    this.reference.targetRange = this.serializedRange;
    this.createReference();
  }

  referenceFormSubmit = (reference) => {
    reference.sourceDocument = this.props.document._id;
    reference.sourceRange = this.serializedRange;
    this.reference = reference;

    if(!this.modal.state.selectPart){
      return this.createReference();
    }

    return this.loadTargetDocument();
  }

  loadTargetDocument = () => {
    let promise = api.get('documents?_id='+this.modal.state.documentSelected)
    .then((response) => {
      let document = response.json.rows[0].value;
      this.setState({targetDocument: document});
    });

    this.setState({targetDocument: {pages:[], css:[]}});

    return promise;
  }

  componentDidMount = () => {
    this.renderReferences();
  }

  componentDidUpdate = () => {
    this.renderReferences();
  }

  componentWillReceiveProps = (nextProps) => {
    if(nextProps.references != this.props.references) {
      this.referencesAlreadyRendered = false;
    }
  }

  renderReferences = () => {
    if(this.props.references && !this.referencesAlreadyRendered){
      this.props.references.forEach((reference) => {
        this.wrapReference(reference.value);
      });

      this.referencesAlreadyRendered = true;
    }
  }

  addReference = (reference) => {
    this.props.references.push(reference);
    this.wrapReference(reference.value);
  }

  wrapReference = (reference) => {
    let range = TextRange.restore(reference.sourceRange, this.contentContainer)
    let wrapper = document.createElement('span');
    if(reference.title){
      wrapper.setAttribute('title', reference.title);
    }

    wrapper.classList.add('reference');

    if(reference._id){
      wrapper.setAttribute('ref', reference._id);
    }

    wrap(wrapper, range);
  }

  simulateSelection = (range) => {
    let wrapper = document.createElement('span');
    wrapper.classList.add('fake-selection');
    this.fakeSelection = wrap(wrapper, range);
  }

  toggleModal = () => {
      this.modal.state.show ? this.closeModal() : this.openModal()
  }

  openModal = () => {
    if(!this.state.textIsSelected) {
      return;
    }
    this.modal.show();
    this.modal.search();
  }

  closeModal = () => {
    this.unwrapFakeSelection();
    if(this.modal){
      this.modal.hide();
    }
  }

  renderUI = () => {
    if(this.state.targetDocument){
      return (
        <div className="reference-banner">
              <div className="reference-banner-row">
                <div>
                  You are coming from
                </div>
                <div>
                  {this.props.document.title}
                </div>
              </div>
              <div className="reference-banner-row">
                <div>
                  You are referencing to
                </div>
                <div>
                  ...
                </div>
              </div>
              <div className="reference-banner-row">
                <div>
                </div>
                <div>
                  <button onClick={this.createPartSelection} className="btn btn-primary">
                    <i className="fa fa-link"></i>&nbsp;
                    Create reference
                  </button>
                </div>
              </div>
        </div>
      );
    }

    return (
      <div>
        <ReferenceForm ref={(ref) => this.modal = ref} onClose={this.closeModal} onSubmit={this.referenceFormSubmit}/>
      </div>
    );
  }

  render = () => {

    let document = this.state.targetDocument || this.props.document;

    return (
      <div>
        {this.renderUI()}
        <div className="panel-content">
          <div ref={(ref) => this.contentContainer = ref} onClick={this.handleClick} className="pages" onMouseUp={this.textSelectionHandler} onTouchEnd={this.textSelectionHandler}>
            {document.pages.map((page, index) => {
              let html = {__html: page}
              let id = index;
              return <div id={id} key={index} dangerouslySetInnerHTML={html} ></div>
            })}
          </div>
        </div>

        {document.css.map((css, index) => {
          let html = {__html: css}
          return <style type="text/css" key={index} dangerouslySetInnerHTML={html}></style>
        })}
      </div>
    )
  };

}

export default Document;
