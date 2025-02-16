import { defineEventHandler, getQuery, readBody } from 'h3'
import { $fetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const token = (query.token as string) || event.node.req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      event.node.res.statusCode = 401
      return {
        success: false,
        message: 'No authorization token provided'
      }
    }

    const action = (query.action as string) || 'get'
    const id = (query.id as string) || ''
    const perPage = parseInt((query.perPage as string) || '5', 10)
    const page = parseInt((query.page as string) || '1', 10)
    const filter = (query.filter as string) || ''

    // Common headers for all requests
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    const runtimeConfig = useRuntimeConfig()
    const baseUrl = `${runtimeConfig.env.apiUrl}/broadcast-authorization`

    switch (action) {
      case 'createAuthorization': {
        const body = await readBody(event)
        
        try {
          const response = await $fetch(baseUrl, {
            method: 'POST',
            headers,
            body
          })

          event.node.res.statusCode = 201
          return {
            success: true,
            data: response,
            message: 'Broadcast authorization created successfully'
          }
        } catch (error) {
          // Handle specific error cases
          if (error.response?.status === 401) {
            event.node.res.statusCode = 401
            return {
              success: false,
              message: 'Invalid or expired authentication token'
            }
          }
          
          throw error // Re-throw other errors to be caught by the main try-catch
        }
      }

      case 'findOne': {
        const response = await $fetch(`${baseUrl}/${id}`, {
          method: 'GET',
          headers
        })
        
        return {
          success: true,
          data: response
        }
      }

      case 'findAll': {
        const response = await $fetch(baseUrl, {
          method: 'GET',
          headers
        })

        const data = Array.isArray(response) ? response : response.data
        const total = Array.isArray(response) ? response.length : response.metaData?.totalitems

        // Apply filtering and pagination
        const filteredData = filter
          ? data.filter(item => 
              Object.values(item).some(val => 
                String(val).toLowerCase().includes(filter.toLowerCase())
              )
            )
          : data

        const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage)

        return {
          success: true,
          data: paginatedData,
          total: total || filteredData.length,
          page,
          perPage
        }
      }

      case 'updateAuthorization': {
        const body = await readBody(event)
        
        const response = await $fetch(`${baseUrl}/${id}`, {
          method: 'PUT',
          headers,
          body
        })

        return {
          success: true,
          data: response,
          message: 'Broadcast authorization updated successfully'
        }
      }

      case 'delete': {
        await $fetch(`${baseUrl}/${id}`, {
          method: 'DELETE',
          headers
        })

        return {
          success: true,
          message: 'Broadcast authorization deleted successfully'
        }
      }

      default:
        event.node.res.statusCode = 400
        return {
          success: false,
          message: 'Invalid action'
        }
    }
  } catch (error) {
    console.error('API Error:', error)
    
    const statusCode = error.response?.status || 500
    event.node.res.statusCode = statusCode

    return {
      success: false,
      message: error.message || 'An error occurred while processing your request',
      error: {
        status: statusCode,
        detail: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }
  }
});

// Fetch a single nature by ID
async function findOne(id: string, token: string) {
  console.log('findOne ' + token);
  const runtimeConfig = useRuntimeConfig();
  const data = await $fetch(
    runtimeConfig.env.apiUrl + '/broadcast-authorization/' + id,
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    }
  ).catch((error) => console.log(error));
  return Promise.resolve(data);
}

// Fetch all natures (used for duplicate checks)
async function findAll1(token: string) {
  console.log('findAll1 ' + token);
  const runtimeConfig = useRuntimeConfig();
  try {
    const data = await $fetch(
      runtimeConfig.env.apiUrl + '/broadcast-authorization',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-type': 'application/json',
        },
      }
    );
    // Ensure the response is an array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching all natures:', error);
    return []; // Return an empty array in case of error
  }
}

// Create a new nature
async function createAuthorization(body: any, token: string) {
  console.log('createAuthorization ' + token);
  const runtimeConfig = useRuntimeConfig();
  try {
    const data = await $fetch(
      runtimeConfig.env.apiUrl + '/broadcast-authorization',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-type': 'application/json',
        },
        body,
      }
    );
    return data;
  } catch (error) {
    console.error('Error creating nature:', error);
    console.error('Request body:', body); // Log the request body
    throw new Error('Failed to create nature: ' + error.message);
  }
}

// Update an existing nature
async function updateAuthorization(id: string, body: any, token: string) {
  console.log('updateAuthorization ' + token);
  const runtimeConfig = useRuntimeConfig();
  const data = await $fetch(
    runtimeConfig.env.apiUrl + '/broadcast-authorization/' + id,
    {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body,
    }
  ).catch((error) => console.log(error));
  return Promise.resolve(data);
}

// Delete a nature
async function deleteAuthorization(id: string, token: string) {
  console.log('deleteNature ' + token);
  const runtimeConfig = useRuntimeConfig();
  const data = await $fetch(
    runtimeConfig.env.apiUrl + '/broadcast-authorization/' + id,
    {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
    }
  ).catch((error) => console.log(error));
  return Promise.resolve(data);
}

// Fetch all natures (used for the main findAll action)
async function findAll(token: string) {
  console.log('findAll called with token:', token);
  const runtimeConfig = useRuntimeConfig();
  try {
    const data = await $fetch(
      runtimeConfig.env.apiUrl + '/broadcast-authorization',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-type': 'application/json',
        },
      }
    );
    //console.log('Backend raw response:', data);
    // Handle both cases: array or object with a `data` property
    const responseData = Array.isArray(data) ? data : data.data;
    //console.log('Processed response data:', responseData);
    return {
      metaData: {
        totalitesm: responseData.length,
      },
      data: responseData,
    };
  } catch (error) {
    console.error('Error fetching all natures:', error);
    return {
      metaData: {
        totalitesm: 0,
      },
      data: [],
    };
  }
}