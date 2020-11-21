  export const getCompanyOfficesProductsAndServices = /* GraphQL */ `
  query getCompanyProductsAndServices($id: ID!) {
    getCompany(id: $id) {
      id
      name
      offices(filter: {deleted: {ne: true}}) {
        items {
          id
          name
          administrator
          categoryId
          image
          employees {
            items {
              id
              name
              username
              officeId
              services {
                items {
                  id
                  service {
                    cost
                    name
                    id
                  }
                }
              }
            }
          }
          location
          deleted
          deletedAt
          createdAt
          owner
        }
      }
      services {
        items {
          id
          service {
            name
            cost
            id
          }
          cost
        }
      }
      products {
        items {
          id
          product {
            name
            cost
            id
          }
          cost
        }
      }
    }
  }
`;

export const getCompany = /* GraphQL */ `
query getCompanyProductsAndServices($id: ID!) {
  getCompany(id: $id) {
    id
    name
    services {
      items {
        id
        service {
          name
          cost
          id
        }
        cost
      }
    }
  }
}
`;

export const getCompanyBasic = /* GraphQL */ `
query getCompanyBasic($id: ID!) {
  getCompany(id: $id) {
    id
    name
  }
}
`;

export const getOfficeBasic = /* GraphQL */ `
  query GetOffice($id: ID!) {
    getOffice(id: $id) {
      id
      name
    }
  }
`;

export const listCompanys = /* GraphQL */ `
  query ListCompanys(
    $filter: ModelCompanyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCompanys(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        offices(filter: {deleted: {ne: true}}) {
          items {
            administrator
            id
            location
            owner
          }
        }
      }
    }
  }
`;

export const listEmployees = `
  query Employees($id: String!) {
    listEmployees(filter: {officeId: {eq: $id}}) {
      items {
        id
        name
        username
        services {
          items {
            id
            service {
              cost
              name
              id
            }
          }
        }
      }
    }
  }
`;

export const listEmployeesFromOffice = `
query Office($id: String!) {
  getOffice(id: $id) {
    employees {
      items {
        name
        id
        username
        services {
          items {
            id
            service {
              cost
              name
              id
            }
          }
        }
      }
    }
  }
}
`;

export const getOffice = /* GraphQL */ `
  query GetOffice($id: ID!) {
    getOffice(id: $id) {
      id
      name
      administrator
      employees {
        items {
          id
          name
          username
          officeId
          services {
            items {
              service {
                name
                id
                cost
              }
            }
          }
        }
        nextToken
      }
      categoryId
      image
      location
      createdAt
      companyId
      owner
    }
  }
`;

export const listRequests = /* GraphQL */ `
  query ListRequests(
    $filter: ModelRequestFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRequests(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
      }
      nextToken
    }
  }
`;

export const listRequestsFull = /* GraphQL */ `
  query ListRequests(
    $filter: ModelRequestFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRequests(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        companyId
        service {
          items {
            id
            cost
            service {
              name
            }
          }
        }
        resposible {
          items {
            id
            employee {
              name
              officeId
              username
            }
          }
        }
        product {
          nextToken
        }
        resposibleName
        customerName
        customerUsername
        state
        paymentType
        deleted
        deletedAt
        createdAt
      }
      nextToken
    }
  }
`;

export const listRequestsPerDay = /* GraphQL */ `
  query ListRequests(
    $filter: ModelRequestFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRequests(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        service {
          items {
            service {
              name
              cost
            }
            cost
          }
        }
        product {
          items {
            product {
              name
              cost
            }
            cost
          }
        }
        paymentType
        customerName
        createdAt
      }
      nextToken
    }
  }
`;

export const listOffices = /* GraphQL */ `
  query ListOffices(
    $filter: ModelOfficeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOffices(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        administrator
        employees {
          items {
            id
            name
            username
            officeId
            services {
              items {
                id
                service {
                  name
                  id
                }
              }
            }
          }
        }
        location
        deleted
        deletedAt
        createdAt
        owner
      }
      nextToken
    }
  }
`;

export const listOfficesHome = /* GraphQL */ `
  query ListOffices(
    $filter: ModelOfficeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listOffices(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        administrator
        employees {
          items{
            id
          }
        }
        categoryId
        image
        location
        deleted
        deletedAt
        createdAt
        companyId
        owner
      }
      nextToken
    }
  }
`;