import { defineEventHandler, getQuery, readBody } from 'h3';
import { $fetch } from 'ofetch';

export default defineEventHandler(async (event) => {
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
    const data = await createNature(body, token);
    return { data, success: true };
  } else if (action === 'updateNature') {
    const body = await readBody(event);
    const data = await updateNature(id, body, token);
    return { data, success: true };
  } else if (action === 'delete') {
    const data = await deleteNature(id, token);
    return { data, success: true };
  }
});

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