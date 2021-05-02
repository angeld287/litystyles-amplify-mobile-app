import { API, graphqlOperation } from 'aws-amplify';

const getListCompleted = async (graphqlQueryName, listGraphqlQuery, _filter) => {

    try {

        var apiResult = null;
        var resultList = [];
        var queryResult = null;
        var _nextToken = null;
     
        apiResult = await API.graphql(graphqlOperation(
                listGraphqlQuery, 
                { limit: 500, filter: _filter }
            ));
        
        queryResult = apiResult.data[graphqlQueryName];
        _nextToken = queryResult.nextToken;
        resultList = queryResult.items;
     
        while (_nextToken !== null) {
           apiResult = await API.graphql(graphqlOperation(
               listGraphqlQuery, 
               { limit: 100, filter: _filter, nextToken: _nextToken}
           ));
           queryResult = apiResult.data[graphqlQueryName];
     
           if(queryResult.items.length > 0){
               queryResult.items.forEach(e => resultList.push(e));
           }
           _nextToken = queryResult.nextToken;
        }
     
         return resultList;      

    } catch (error) {
        console.log(error);
        return [];
    }
   
}

export default getListCompleted;