import { defineEventHandler, getQuery, readBody } from 'h3';
import { $fetch } from 'ofetch';

export default defineEventHandler(async (event) => {
  console.log('Request received:', event.node.req.url); // Log the request URL
  try {
    const query = getQuery(event);
    console.log('Query parameters:', query); // Log the query parameters

    const perPage = parseInt((query.perPage as string) || '5', 10);
    const page = parseInt((query.page as string) || '1', 10);
    const filter = (query.filter as string) || '';
    const action = (query.action as string) || 'get';
    const id = (query.id as string) || '';
    const token = (query.token as string) || '';

    console.log('Action:', action); // Log the action

    if (action === 'findOne') {
      const data = await findOne(id, token);
      return { data, success: true };
    } else if (action === 'findAll') {
      const data = await findAll(token);
      return {
        total: data.metaData.totalitesm,
        data: filterData(data, filter, page, perPage),
      };
    } else if (action === 'createAuthorization') {
      const body = await readBody(event);
      console.log('Request body:', body); // Log the request body
      const data = await createAuthorization(body, token);
      event.node.res.statusCode = 201; // Use 201 Created for successful creation
      return {
        success: true,
        data,
        message: 'Nature créée avec succès',
      };
    } else if (action === 'updateAuthorization') {
      const body = await readBody(event);
      console.log('Request body:', body); // Log the request body

      // For updates, check if another record (besides the one being updated) has the same values
      const existingRecords = await findAll(token);
      const exists = existingRecords.some(
        (record: any) =>
          record._id !== id &&
          record.name.toLowerCase() === body.name.toLowerCase() &&
          record.type === body.type &&
          record.program === body.program
      );

      if (exists) {
        event.node.res.statusCode = 409;
        return {
          success: false,
          message: 'Une nature avec ces paramètres existe déjà',
        };
      }

      const data = await updateAuthorization(id, body, token);
      return { data, success: true };
    } else if (action === 'delete') {
      const data = await deleteAuthorization(id, token);
      return { data, success: true };
    }

    // If no action matches, return an error
    event.node.res.statusCode = 400;
    return {
      success: false,
      message: 'Invalid action',
    };
  } catch (error) {
    console.error('API Error:', error);
    event.node.res.statusCode = 500;
    return {
      success: false,
      message: 'Une erreur est survenue lors du traitement de votre demande',
    };
  }
});
// Helper function to filter and paginate data
function filterData(
  response: any, // Accept the full response object
  filter: string,
  page: number,
  perPage: number
) {
  const data = Array.isArray(response) ? response : response.data; // Handle both cases
  const offset = (page - 1) * perPage;

  if (!filter) {
    return data.slice(offset, offset + perPage);
  }

  const filterRe = new RegExp(filter, 'i');
  return data
    .filter((item) =>
      [item.name, item.type, item.program].some((field) => field.match(filterRe))
    )
    .slice(offset, offset + perPage);
}

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