import config from 'config';
import { authHeader } from '../_helpers';

export const userService = {
    login,
    updateuser,
    logout,
    register,
    getAll,
    applyAll,
    getById,
    update,
    delete: _delete,
    addmodel,
    addselections,
    getAllmodels,
    deletemodels:_deletemodels,
    usernewmodel,
    updatepersonalinfo
};

function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    return fetch(`${config.apiUrl}/users/authenticate`, requestOptions)
        .then(handleResponse)
        .then(user => {
            // login successful if there's a jwt token in the response
            if (user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
            }

            return user;
        });
}

function updateuser(user){
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user })
    };

    return fetch(`${config.apiUrl}/users/refresh`, requestOptions)
        .then(handleResponse)
        .then(user => {
            // login successful if there's a jwt token in the response
            if (user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
            }

            return user;
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function register(user) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`${config.apiUrl}/users/register`, requestOptions).then(handleResponse);
}

function addmodel(user,modelname,xml,data,id) {
    let history = [];
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({user,modelname,xml,data,id,history})
    };

    return fetch(`${config.apiUrl}/models/add`, requestOptions).then(handleResponse);
}

function usernewmodel(modelname, id) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({modelname, id})
    };

    return fetch(`${config.apiUrl}/users/addmodel`, requestOptions).then(handleResponse);
}

function addselections(id, selected_list, selected_list_name,disselected_list, disselected_list_name, name) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id, selected_list, selected_list_name,disselected_list, disselected_list_name, name})
    };

    return fetch(`${config.apiUrl}/models/addselections`, requestOptions).then(handleResponse).then(user => {
        // login successful if there's a jwt token in the response
        if (user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));
        }

        return user;
    });
}

function updatepersonalinfo(r1,r2,r3,r4,r5,status,role,id) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({r1,r2,r3,r4,r5,status,role,id})
    };

    return fetch(`${config.apiUrl}/users/updateinfo`, requestOptions).then(handleResponse).then(user => {
        // login successful if there's a jwt token in the response
        if (user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem('user', JSON.stringify(user));
        }

        return user;
    });
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/users`, requestOptions).then(handleResponse);
}

function applyAll(id ,selected_list, selections, disselected_list, disselections, name) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
        body: JSON.stringify({id ,selected_list, selections, disselected_list, disselections, name})
    };

    return fetch(`${config.apiUrl}/applyusers`, requestOptions).then(handleResponse);
}

function getAllmodels() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/models`, requestOptions).then(handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/users/${id}`, requestOptions).then(handleResponse);
}

function update(user) {
    const requestOptions = {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`${config.apiUrl}/users/${user.id}`, requestOptions).then(handleResponse);
}

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/users/${id}`, requestOptions).then(handleResponse);
}

function _deletemodels(id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/models/${id}`, requestOptions).then(handleResponse);
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                location.reload(true);
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}