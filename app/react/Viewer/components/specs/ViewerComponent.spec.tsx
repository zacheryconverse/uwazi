import { Provider } from 'react-redux';
import Immutable from 'immutable';
import React from 'react';
import { shallow } from 'enzyme';
import configureStore, { MockStore, MockStoreCreator } from 'redux-mock-store';

import ViewerComponent from '../ViewerComponent';
import PDFView from '../../PDFView';
import EntityView from '../../EntityView';

const mockStoreCreator: MockStoreCreator<object> = configureStore<object>([]);
const renderComponent = (store: MockStore<object>) =>
  shallow(
    <Provider store={store}>
      <ViewerComponent location={{}} />
    </Provider>
  )
    .dive({ context: { store } })
    .dive();

describe('ViewerComponent', () => {
  const entity = { _id: 'id', sharedId: 'sharedId', documents: [{ _id: 'docId' }] };

  describe('when there is documents on the entity', () => {
    it('should render PDFView and pass down default document', () => {
      const store: MockStore<object> = mockStoreCreator({
        documentViewer: {
          doc: Immutable.fromJS(entity),
        },
        settings: {
          collection: Immutable.fromJS({ languages: [{ key: 'es', default: true }] }),
        },
      });

      const component = renderComponent(store);
      expect(component.find(PDFView).length).toBe(1);
      expect(component.find(PDFView).props().document).toEqual({ _id: 'docId' });
    });
  });

  describe('when there is no documents on the entity', () => {
    it('should render entityView', () => {
      const store: MockStore<object> = mockStoreCreator({
        documentViewer: {
          doc: Immutable.fromJS({ ...entity, documents: [] }),
        },
        settings: {
          collection: Immutable.fromJS({ languages: [{ key: 'es', default: true }] }),
        },
      });

      const component = renderComponent(store);
      expect(component.find(EntityView).length).toBe(1);
    });
  });
});
