import { defineEventHandler, getQuery, readBody } from 'h3';
import { $fetch } from 'ofetch';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const perPage = parseInt((query.perPage as string) || '5', 10);
    const page = parseInt((query.page as string) || '1', 10);
    const filter = (query.filter as string) || '';
    const action = (query.action as string) || 'get';
    const id = (query.id as string) || '';
    const token = (query.token as string) || '';

    if (action === 'findOne') {
      const data = await findOne(id, token);
      return { data, success: true };
    } else if (action === 'findAll') {
      const data = await findAll(token);
      return {
        total: data.length,
        data: filterData(data, filter, page, perPage),
      };
    } else if (action === 'createNature') {
      const body = await readBody(event);
      
      // Check for existing record with same name
      const existingRecords = await findAll(token);
      const exists = existingRecords.some(
        (record: any) => 
          record.name.toLowerCase() === body.name.toLowerCase() &&
          record.type === body.type &&
          record.program === body.program
      );

      if (exists) {
        event.node.res.statusCode = 409; // Conflict status code
        return {
          success: false,
          message: 'Une nature avec ces paramètres existe déjà'
        };
      }

      const data = await createNature(body, token);
      event.node.res.statusCode = 204;
      return;
    } else if (action === 'updateNature') {
      const body = await readBody(event);
      
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
          message: 'Une nature avec ces paramètres existe déjà'
        };
      }

      const data = await updateNature(id, body, token);
      return { data, success: true };
    } else if (action === 'delete') {
      const data = await deleteNature(id, token);
      return { data, success: true };
    }
  } catch (error) {
    console.error('API Error:', error);
    event.node.res.statusCode = 500;
    return { 
      success: false, 
      message: 'Une erreur est survenue lors du traitement de votre demande' 
    };
  }
});

// ... rest of your existing functions remain the same ...

function filterData(
  data: any[],
  filter: string,
  page: number,
  perPage: number
) {
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

async function findOne(id: string, token: string) {
  console.log('findOne ' + token);
  const runtimeConfig = useRuntimeConfig();
  const data = await $fetch(
    runtimeConfig.env.apiUrl + '/broadcast-authorization-nature/' + id,
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

async function findAll(token: string) {
  console.log('findAll ' + token);
  const runtimeConfig = useRuntimeConfig();
  const data = await $fetch(
    runtimeConfig.env.apiUrl + '/broadcast-authorization-nature',
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

async function createNature(body: any, token: string) {
  console.log('createNature ' + token);
  const runtimeConfig = useRuntimeConfig();
  const data = await $fetch(
    runtimeConfig.env.apiUrl + '/broadcast-authorization-nature',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body,
    }
  ).catch((error) => console.log(error));
  return Promise.resolve(data);
  
}

async function updateNature(id: string, body: any, token: string) {
  console.log('updateNature ' + token);
  const runtimeConfig = useRuntimeConfig();
  const data = await $fetch(
    runtimeConfig.env.apiUrl + '/broadcast-authorization-nature/' + id,
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

async function deleteNature(id: string, token: string) {
  console.log('deleteNature ' + token);
  const runtimeConfig = useRuntimeConfig();
  const data = await $fetch(
    runtimeConfig.env.apiUrl + '/broadcast-authorization-nature/' + id,
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