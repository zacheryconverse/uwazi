import semanticSearchAPI from '../SemanticSearchAPI';
import {APIURL} from 'app/config.js';
import backend from 'fetch-mock';

describe('SemanticSearchAPI', () => {
  let searchId;
  let createdResponse = { _id: 'searchCreated' };
  let stoppedResponse = { _id: 'searchId', status: 'stopped' };
  let resumedResponse = { _id: 'searchId', status: 'resumed' };
  let deletedResponse = { _id: 'deleted' };
  let singleResponse = { _id: 'searchId' };
  let searchListResponse = [{ _id: 'search1' }, { _id: 'search2' }];
  beforeEach(() => {
    searchId = 'searchId';
    backend.restore();
    backend
    .get(APIURL + `semantic-search/${searchId}`, { body: JSON.stringify(singleResponse) })
    .get(APIURL + 'semantic-search', { body: JSON.stringify(searchListResponse) })
    .delete(APIURL + `semantic-search/${searchId}`, { body: JSON.stringify(deletedResponse) })
    .post(APIURL + `semantic-search/${searchId}/stop`, { body: JSON.stringify(stoppedResponse) })
    .post(APIURL + `semantic-search/${searchId}/resume`, { body: JSON.stringify(resumedResponse) })
    .post(APIURL + 'semantic-search', { body: JSON.stringify(createdResponse) });
  });

  afterEach(() => {
    backend.restore();
  });

  describe('search', () => {
    it('should post a new search', (done) => {
      const args = { searchTerm: 'term' };
      semanticSearchAPI.search(args)
      .then((response) => {
        expect(response).toEqual(createdResponse);
        expect(JSON.parse(backend.lastOptions(`${APIURL}semantic-search`).body)).toEqual(args);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('stop', () => {
    it('should request stop', (done) => {
      semanticSearchAPI.stopSearch(searchId)
      .then((response) => {
        expect(response).toEqual(stoppedResponse);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('resume', () => {
    it('should request resume', (done) => {
      semanticSearchAPI.resumeSearch(searchId)
      .then((response) => {
        expect(response).toEqual(resumedResponse);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('delete', () => {
    it('should delete the search', (done) => {
      semanticSearchAPI.deleteSearch(searchId)
      .then((response) => {
        expect(response).toEqual(deletedResponse);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('getSearch', () => {
    it('should request the search', (done) => {
      semanticSearchAPI.getSearch(searchId)
      .then((response) => {
        expect(response).toEqual(singleResponse);
        done();
      })
      .catch(done.fail);
    });
  });

  describe('getAllSearches', () => {
    it('should request all searches', (done) => {
      semanticSearchAPI.getAllSearches(searchId)
      .then((response) => {
        expect(response).toEqual(searchListResponse);
        done();
      })
      .catch(done.fail);
    });
  });
});
