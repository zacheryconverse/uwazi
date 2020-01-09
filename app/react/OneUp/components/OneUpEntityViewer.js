/** @format */

import ShowIf from 'app/App/ShowIf';
import { AttachmentsList } from 'app/Attachments';
import { actions as connectionsActions, CreateConnectionPanel } from 'app/Connections';
import { ConnectionsGroups, ConnectionsList } from 'app/ConnectionsList';
import { connectionsChanged, deleteConnection } from 'app/ConnectionsList/actions/actions';
import ContextMenu from 'app/ContextMenu';
import { t } from 'app/I18N';
import { Icon as PropertyIcon, TemplateLabel } from 'app/Layout';
import SidePanel from 'app/Layout/SidePanel';
import { ShowMetadata } from 'app/Metadata';
import { RelationshipsFormButtons } from 'app/Relationships';
import AddEntitiesPanel from 'app/Relationships/components/AddEntities';
import RelationshipMetadata from 'app/Relationships/components/RelationshipMetadata';
import { fromJS as Immutable } from 'immutable';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { TabContent, TabLink, Tabs } from 'react-tabs-redux';
import { bindActionCreators } from 'redux';
import { createSelector } from 'reselect';
import { Icon } from 'UI';
import { deleteEntity } from 'app/Entities/actions/actions';
import {
  toggleOneUpFullEdit,
  toggleOneUpLoadConnections,
  switchOneUpEntity,
} from 'app/OneUp/actions/actions';
import { showTab } from 'app/Entities/actions/uiActions';
import EntityForm from 'app/Entities/containers/EntityForm';
import { ShowSidepanelMenu } from 'app/Entities/components/ShowSidepanelMenu';

export class EntityViewer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      panelOpen: true,
    };
    this.deleteEntity = this.deleteEntity.bind(this);
    this.closePanel = this.closePanel.bind(this);
    this.openPanel = this.openPanel.bind(this);
  }

  deleteEntity() {
    this.context.confirm({
      accept: () => {
        this.props.deleteEntity(this.props.rawEntity.toJS()).then(() => {
          browserHistory.goBack();
        });
      },
      title: 'Confirm delete',
      message: 'Are you sure you want to delete this entity?',
    });
  }

  deleteConnection(reference) {
    if (reference.sourceType !== 'metadata') {
      this.context.confirm({
        accept: () => {
          this.props.deleteConnection(reference);
        },
        title: 'Confirm delete connection',
        message: 'Are you sure you want to delete this connection?',
      });
    }
  }

  closePanel() {
    this.setState({ panelOpen: false });
  }

  openPanel() {
    this.setState({ panelOpen: true });
  }

  render() {
    const {
      entity,
      entityBeingEdited,
      tab,
      connectionsGroups,
      relationships,
      oneUpState,
    } = this.props;
    const { panelOpen } = this.state;
    const selectedTab = tab || 'info';

    const docAttachments = entity.attachments ? entity.attachments : [];
    const attachments = entity.file ? [entity.file].concat(docAttachments) : docAttachments;

    const summary = connectionsGroups.reduce(
      (summaryData, g) => {
        g.get('templates').forEach(template => {
          summaryData.totalConnections += template.get('count');
        });
        return summaryData;
      },
      { totalConnections: 0 }
    );

    return (
      <div className="row">
        <Helmet title={entity.title ? entity.title : 'Entity'} />
        <div className="content-header content-header-entity">
          <div className="content-header-title">
            Document {oneUpState.indexInDocs + 1} out of {oneUpState.totalDocs}
          </div>
        </div>
        <main className={`entity-viewer ${panelOpen ? 'with-panel' : ''}`}>
          <Tabs selectedTab={selectedTab}>
            <TabContent
              for={selectedTab === 'info' || selectedTab === 'attachments' ? selectedTab : 'none'}
            >
              <div className="entity-metadata">
                {entityBeingEdited && oneUpState.fullEdit ? (
                  <EntityForm showSubset="no-multiselect" />
                ) : (
                  <div>
                    <div className="content-header-title">
                      <PropertyIcon
                        className="item-icon item-icon-center"
                        data={entity.icon}
                        size="sm"
                      />
                      <h1 className="item-name">{entity.title}</h1>
                      <TemplateLabel template={entity.template} />
                    </div>
                    <ShowMetadata
                      relationships={relationships}
                      entity={entity}
                      showTitle={false}
                      showType={false}
                      showSubset="no-multiselect"
                    />
                    <AttachmentsList
                      files={Immutable(attachments)}
                      parentId={entity._id}
                      parentSharedId={entity.sharedId}
                      isDocumentAttachments={Boolean(entity.file)}
                      entityView
                      processed={entity.processed}
                    />
                  </div>
                )}
              </div>
            </TabContent>
            <TabContent for="connections">
              <ConnectionsList deleteConnection={this.deleteConnection.bind(this)} searchCentered />
            </TabContent>
          </Tabs>
        </main>
        <div className="sidepanel-footer">
          <button
            onClick={() => this.props.switchOneUpEntity(+1, true)}
            className={
              !this.props.isPristine
                ? 'save-and-next btn btn-default btn-success'
                : 'btn btn-default btn-disabled'
            }
          >
            <Icon icon="save" />
            <span className="btn-label">{t('System', 'Save and go to next')}</span>
          </button>
          <button
            onClick={() => this.props.switchOneUpEntity(0, true)}
            className={
              !this.props.isPristine
                ? 'save-metadata btn btn-default'
                : 'btn btn-default btn-disabled'
            }
          >
            <Icon icon="save" />
            <span className="btn-label">{t('System', 'Save document')}</span>
          </button>
          <button
            onClick={() => this.props.switchOneUpEntity(0, false)}
            className={
              !this.props.isPristine
                ? 'cancel-edit-metadata btn btn-danger'
                : 'btn btn-default btn-disabled'
            }
          >
            <Icon icon="undo" />
            <span className="btn-label">{t('System', 'Discard changes')}</span>
          </button>
          <button
            onClick={() => this.props.toggleOneUpFullEdit()}
            className={
              this.props.isPristine || !oneUpState.fullEdit
                ? 'btn btn-default'
                : 'btn btn-default btn-disabled'
            }
          >
            <Icon icon="pencil-alt" />
            <span className="btn-label">
              {t('System', oneUpState.fullEdit ? 'Cancel edit document' : 'Edit document')}
            </span>
          </button>
          <button
            onClick={() =>
              this.props.isPristine
                ? this.props.switchOneUpEntity(-1, false)
                : this.context.confirm({
                    accept: () => this.props.switchOneUpEntity(-1, false),
                    title: 'Confirm discard changes',
                    message:
                      'There are unsaved changes. Are you sure you want to discard them and switch to a different document?',
                  })
            }
            className={
              oneUpState.indexInDocs > 0
                ? `btn ${this.props.isPristine ? 'btn-default' : 'btn-warning'}`
                : 'btn btn-default btn-disabled'
            }
          >
            <Icon icon="arrow-left" />
            <span className="btn-label">{t('System', 'Previous document')}</span>
          </button>
          <button
            onClick={() =>
              this.props.isPristine
                ? this.props.switchOneUpEntity(+1, false)
                : this.context.confirm({
                    accept: () => this.props.switchOneUpEntity(+1, false),
                    title: 'Confirm discard changes',
                    message:
                      'There are unsaved changes. Are you sure you want to discard them and switch to a different document?',
                  })
            }
            className={`btn ${this.props.isPristine ? 'btn-default' : 'btn-warning'}`}
          >
            <Icon icon="arrow-right" />
            <span className="btn-label">{t('System', 'Next document')}</span>
          </button>
        </div>
        <ShowIf if={selectedTab === 'connections'}>
          <div className="sidepanel-footer">
            <RelationshipsFormButtons />
          </div>
        </ShowIf>
        <SidePanel className={`entity-connections entity-${this.props.tab}`} open={panelOpen}>
          <div className="sidepanel-header">
            <button type="button" className="closeSidepanel close-modal" onClick={this.closePanel}>
              <Icon icon="times" />
            </button>
            <Tabs
              className="content-header-tabs"
              selectedTab={selectedTab}
              handleSelect={tabName => {
                this.props.showTab(tabName);
              }}
            >
              <ul className="nav nav-tabs">
                <li>
                  <TabLink to="info">
                    <Icon icon="info-circle" />
                    <span className="tab-link-tooltip">{t('System', 'Info')}</span>
                  </TabLink>
                </li>
                <li>
                  <TabLink to="connections">
                    <Icon icon="exchange-alt" />
                    <span className="connectionsNumber">{summary.totalConnections}</span>
                    <span className="tab-link-tooltip">{t('System', 'Connections')}</span>
                  </TabLink>
                </li>
              </ul>
            </Tabs>
          </div>
          <div className="sidepanel-body">
            <Tabs selectedTab={selectedTab}>
              <TabContent for={selectedTab === 'connections' ? selectedTab : 'none'}>
                <ConnectionsGroups />
                <div className="sidepanel-footer">
                  <button
                    onClick={() => this.props.toggleOneUpLoadConnections()}
                    className={
                      this.props.isPristine ? 'btn btn-default' : 'btn btn-default btn-disabled'
                    }
                  >
                    <Icon icon="times" />
                    <span className="btn-label">
                      {t(
                        'System',
                        oneUpState.loadConnections ? 'Hide Connections' : 'Load Connections'
                      )}
                    </span>
                  </button>
                </div>
              </TabContent>
              <TabContent for={selectedTab === 'info' ? selectedTab : 'none'}>
                <EntityForm showSubset="only-multiselect" />
              </TabContent>
            </Tabs>
          </div>
        </SidePanel>
        <ContextMenu
          align="bottom"
          overrideShow
          show={!panelOpen}
          className="show-info-sidepanel-context-menu"
        >
          <ShowSidepanelMenu
            className="show-info-sidepanel-menu"
            panelIsOpen={panelOpen}
            openPanel={this.openPanel}
          />
        </ContextMenu>
        <CreateConnectionPanel
          className="entity-create-connection-panel"
          containerId={entity.sharedId}
          onCreate={this.props.connectionsChanged}
        />
        <AddEntitiesPanel />
        <RelationshipMetadata />
      </div>
    );
  }
}

EntityViewer.defaultProps = {
  relationships: Immutable([]),
  oneUpState: {},
};

EntityViewer.propTypes = {
  entity: PropTypes.object,
  relationships: PropTypes.object,
  rawEntity: PropTypes.object,
  entityBeingEdited: PropTypes.bool,
  sidepanelOpen: PropTypes.bool,
  connectionsGroups: PropTypes.object,
  relationTypes: PropTypes.array,
  deleteEntity: PropTypes.func,
  connectionsChanged: PropTypes.func,
  deleteConnection: PropTypes.func,
  startNewConnection: PropTypes.func,
  tab: PropTypes.string,
  library: PropTypes.object,
  showTab: PropTypes.func,
  isPristine: PropTypes.bool,
  // function(delta (-1, 0, +1) and shouldSave bool) => dispatch => {...}
  switchOneUpEntity: PropTypes.func,
  toggleOneUpFullEdit: PropTypes.func,
  toggleOneUpLoadConnections: PropTypes.func,
  oneUpState: PropTypes.object,
};

EntityViewer.contextTypes = {
  confirm: PropTypes.func,
};

const selectEntity = createSelector(
  state => state.entityView.entity,
  entity => entity.toJS()
);

const selectRelationTypes = createSelector(
  s => s.relationTypes,
  r => r.toJS()
);

const mapStateToProps = state => ({
  rawEntity: state.entityView.entity,
  rawEntityForm: state.entityView.entityForm,
  relationTypes: selectRelationTypes(state),
  entity: selectEntity(state),
  relationships: state.entityView.entity.get('relationships'),
  connectionsGroups: state.relationships.list.connectionsGroups,
  entityBeingEdited: !!state.entityView.entityForm._id,
  tab: state.entityView.uiState.get('tab'),
  library: state.library,
  isPristine: state.entityView.entityFormState.$form.pristine,
  oneUpState: state.oneUpReview.state.toJS(),
});

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      deleteEntity,
      connectionsChanged,
      deleteConnection,
      showTab,
      startNewConnection: connectionsActions.startNewConnection,
      switchOneUpEntity,
      toggleOneUpFullEdit,
      toggleOneUpLoadConnections,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EntityViewer);
