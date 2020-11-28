export const onCreateRequest = /* GraphQL */ `
  subscription OnCreateRequest($resposibleName: String) {
    onCreateRequest(resposibleName: $resposibleName) {
      id
      companyId
      resposible {
        items {
          id
          createdAt
        }
        nextToken
      }
      service {
        items {
          service {
            name
          }
        }
      }
      product {
        items {
          id
          createdAt
        }
        nextToken
      }
      resposibleName
      customerName
      state
      deleted
      deletedAt
      createdAt
    }
  }
`;

export const onCreateRequestService = /* GraphQL */ `
  subscription OnCreateRequestService($resposibleName: String) {
    onCreateRequestService(resposibleName: $resposibleName) {
      id
      resposibleName
      request {
        id
      }
      service {
        id
        name
        cost
        deleted
        deletedAt
        createdAt
        owner
      }
      createdAt
    }
  }
`;
export const onUpdateRequestC = /* GraphQL */ `
  subscription OnUpdateRequestC($customerUsername: String, $state: State) {
    onUpdateRequestC(customerUsername: $customerUsername, state: $state) {
      id
      companyId
      resposibleName
    }
  }
`;

export const onUpdateRequestE = /* GraphQL */ `
  subscription OnUpdateRequestE($resposibleName: String, $state: State) {
    onUpdateRequestE(resposibleName: $resposibleName, state: $state) {
      id
      companyId
      customerUsername
      resposibleName
    }
  }
`;