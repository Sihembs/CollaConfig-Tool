// array in local storage for registered users
let users = JSON.parse(localStorage.getItem('users')) || [];
let models = JSON.parse(localStorage.getItem('models')) || [];
    
export function configureFakeBackend() {
    let realFetch = window.fetch;
    window.fetch = function (url, opts) {
        return new Promise((resolve, reject) => {
            // wrap in timeout to simulate server api call
            setTimeout(() => {

                // authenticate
                if (url.endsWith('/users/authenticate') && opts.method === 'POST') {
                    // get parameters from post request
                    let params = JSON.parse(opts.body);

                    if(params.username === 'admin' && params.password === 'admin')
                    {
                        let responseJson = {
                            username: params.username,
                            token: 'fake-jwt-token'
                        };
                        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(responseJson)) });
                        return;
                    }

                    // find if any user matches login credentials
                    let filteredUsers = users.filter(user => {
                        return user.username === params.username && user.password === params.password;
                    });

                    if (filteredUsers.length) {
                        // if login details are valid return user details and fake jwt token
                        let user = filteredUsers[0];
                        let responseJson = {
                            id: user.id,
                            username: user.username,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            r1: user.MCS.r1,
                            r2: user.MCS.r2,
                            r3: user.MCS.r3,
                            r4: user.MCS.r4,
                            r5: user.MCS.r5,
                            model_selections: user.model_selections,
                            status: user.status,
                            role: user.role,
                            token: 'fake-jwt-token'
                        };
                        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(responseJson)) });
                    } else {
                        // else return error
                        reject('Username or password is incorrect');
                    }

                    return;
                }

                // authenticate
                if (url.endsWith('/users/refresh') && opts.method === 'POST') {
                    // get parameters from post request
                    let params = JSON.parse(opts.body);

                    // find if any user matches login credentials
                    let filteredUsers = users.filter(user => {
                        return user.id === params.user.id;
                    });

                    if (filteredUsers.length) {
                        // if login details are valid return user details and fake jwt token
                        let user = filteredUsers[0];
                        let responseJson = {
                            id: user.id,
                            username: user.username,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            r1: user.MCS.r1,
                            r2: user.MCS.r2,
                            r3: user.MCS.r3,
                            r4: user.MCS.r4,
                            r5: user.MCS.r5,
                            model_selections: user.model_selections,
                            status: user.status,
                            role: user.role,
                            token: 'fake-jwt-token'
                        };
                        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(responseJson)) });
                    } else {
                        // else return error
                        reject('Username or password is incorrect');
                    }

                    return;
                }

                if (url.endsWith('/users/addmodel') && opts.method === 'POST') {
                    let temp = JSON.parse(opts.body);
                    for(let i = 0; i < users.length; i++)
                    {
                        if(users[i].id === temp.id)
                        {
                            let checkpoint = true;
                            for(let j = 0; j < users[i].model_selections.length; j++)
                            {
                                if(users[i].model_selections[j].name === temp.modelname)
                                    checkpoint = false;
                            }
                            if(checkpoint)
                            {
                                let cache = {};
                                cache.name = temp.modelname;
                                cache.selections = [];
                                cache.selections_name = [];
                                cache.disselections = [];
                                cache.disselections_name = [];
                                cache.history = [];
                                cache.time = '';
                                users[i].model_selections.push(cache);
                                localStorage.setItem('users', JSON.stringify(users));
                            }
                        }
                    }
                    // respond 200 OK
                    resolve({ ok: true, text: () => Promise.resolve() });

                    return;
                }

                // add models
                if (url.endsWith('/models/add') && opts.method === 'POST') {
                    // get parameters from post request
                    let newModel = JSON.parse(opts.body);

                    // validation
                    let duplicateUser = models.filter(model => { return model.modelname === newModel.modelname; }).length;
                    if (duplicateUser) {
                        return;
                    }

                    let current_user = newModel.user;
                    // save new model
                    newModel.id = models.length ? Math.max(...models.map(model => model.id)) + 1 : 1;
                    delete newModel.user;
                    models.push(newModel);
                    localStorage.setItem('models', JSON.stringify(models));

                    // respond 200 OK
                    resolve({ ok: true, text: () => Promise.resolve() });

                    return;
                }

                 // add model selections
                 if (url.endsWith('/models/addselections') && opts.method === 'POST') {
                    // get parameters from post request
                    let newModel = JSON.parse(opts.body);
                    let responseJson = {};

                    var moment = require('moment');
                    let currenttime = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
                    for(let i = 0; i < users.length; i++)
                    {
                        if(users[i].id === newModel.id)
                        {
                            for(let j = 0; j < users[i].model_selections.length; j++)
                            {
                                if(users[i].model_selections[j].name === newModel.name)
                                {
                                    users[i].model_selections[j].selections = newModel.selected_list;
                                    users[i].model_selections[j].selections_name = newModel.selected_list_name;
                                    users[i].model_selections[j].disselections = newModel.disselected_list;
                                    users[i].model_selections[j].disselections_name = newModel.disselected_list_name;
                                    users[i].model_selections[j].time = currenttime;
                                    localStorage.setItem('users', JSON.stringify(users));
                                    responseJson = {
                                        id: users[i].id,
                                        username: users[i].username,
                                        firstName: users[i].firstName,
                                        lastName: users[i].lastName,
                                        r1: users[i].r1,
                                        r2: users[i].r2,
                                        r3: users[i].r3,
                                        r4: users[i].r4,
                                        r5: users[i].r5,
                                        model_selections: users[i].model_selections,
                                        status: users[i].status,
                                        role: users[i].role,
                                        token: 'fake-jwt-token'
                                    };
                                }
                            }
                        }
                    }

                    // respond 200 OK
                    resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(responseJson)) });

                    return;
                }

                // update the user personal information
                if (url.endsWith('/users/updateinfo') && opts.method === 'POST') {
                    let newuser = JSON.parse(opts.body);
                    let responseJson = {};

                    for(let i = 0; i < users.length; i++)
                    {
                        if(users[i].id === newuser.id)
                        {
                            users[i].MCS.r1 = newuser.r1;
                            users[i].MCS.r2 = newuser.r2;
                            users[i].MCS.r3 = newuser.r3;
                            users[i].MCS.r4 = newuser.r4;
                            users[i].MCS.r5 = newuser.r5;
                            users[i].status = newuser.status;
                            users[i].role = newuser.role;
                            responseJson = {
                                id: newuser.id,
                                username: users[i].username,
                                firstName: users[i].firstName,
                                lastName: users[i].lastName,
                                r1: newuser.r1,
                                r2: newuser.r2,
                                r3: newuser.r3,
                                r4: newuser.r4,
                                r5: newuser.r5,
                                model_selections: users[i].model_selections,
                                status: newuser.status,
                                role: newuser.role,
                                token: 'fake-jwt-token'
                            };
                        }
                    }
                    localStorage.setItem('users', JSON.stringify(users));
                    resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(responseJson)) });

                    return;
                }

                // get users
                if (url.endsWith('/users') && opts.method === 'GET') {
                    // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(users))});
                    } else {
                        // return 401 not authorised if token is null or invalid
                        reject('Unauthorised');
                    }

                    return;
                }

                // apply updates to all users and get users
                if (url.endsWith('/applyusers') && opts.method === 'GET') {
                    let updates = JSON.parse(opts.body);
                    var moment = require('moment');
                    let currenttime = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
                    for(let i = 0; i < users.length; i++)
                    {
                        if(updates.id.includes(users[i].id))
                        {
                            for(let j = 0; j < users[i].model_selections.length; j++)
                            {
                                if(users[i].model_selections[j].name === updates.name)
                                {
                                    if(users[i].model_selections[j].time !== '')
                                    {
                                        let temp = {};
                                        temp.time = users[i].model_selections[j].time;
                                        temp.selections = users[i].model_selections[j].selections;
                                        temp.selections_name = users[i].model_selections[j].selections_name;
                                        temp.disselections = users[i].model_selections[j].disselections;
                                        temp.disselections_name = users[i].model_selections[j].disselections_name;
                                        users[i].model_selections[j].history.push(temp);
                                    }
                                    users[i].model_selections[j].selections = updates.selected_list;
                                    users[i].model_selections[j].selections_name = updates.selections;
                                    users[i].model_selections[j].disselections = updates.disselected_list;
                                    users[i].model_selections[j].disselections_name = updates.disselections;
                                    users[i].model_selections[j].time = currenttime;
                                }
                            }
                        }
                    }
                    for(let i = 0; i < models.length; i++)
                    {
                        if(models[i].modelname === updates.name)
                        {
                            let temp = {};
                            temp.selections = updates.selected_list;
                            temp.selections_name = updates.selections;
                            temp.disselections = updates.disselected_list;
                            temp.disselections_name = updates.disselections;
                            temp.time = currenttime;
                            models[i].history.push(temp);
                        }
                    }
                    localStorage.setItem('models', JSON.stringify(models));
                    localStorage.setItem('users', JSON.stringify(users));

                    // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(users))});
                    } else {
                        // return 401 not authorised if token is null or invalid
                        reject('Unauthorised');
                    }

                    return;
                }

                // get models
                if (url.endsWith('/models') && opts.method === 'GET') {
                    // check for fake auth token in header and return users if valid, this security is implemented server side in a real application
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(models))});
                    } else {
                        // return 401 not authorised if token is null or invalid
                        reject('Unauthorised');
                    }

                    return;
                }

                // get user by id
                if (url.match(/\/users\/\d+$/) && opts.method === 'GET') {
                    // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        // find user by id in users array
                        let urlParts = url.split('/');
                        let id = parseInt(urlParts[urlParts.length - 1]);
                        let matchedUsers = users.filter(user => { return user.id === id; });
                        let user = matchedUsers.length ? matchedUsers[0] : null;

                        // respond 200 OK with user
                        resolve({ ok: true, text: () => JSON.stringify(user)});
                    } else {
                        // return 401 not authorised if token is null or invalid
                        reject('Unauthorised');
                    }

                    return;
                }

                // register user
                if (url.endsWith('/users/register') && opts.method === 'POST') {
                    // get new user object from post body
                    let newUser = JSON.parse(opts.body);

                    // validation
                    let duplicateUser = users.filter(user => { return user.username === newUser.username; }).length;
                    if (duplicateUser) {
                        reject('Username "' + newUser.username + '" is already taken');
                        return;
                    }

                    // save new user
                    newUser.id = users.length ? Math.max(...users.map(user => user.id)) + 1 : 1;
                    users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(users));

                    // respond 200 OK
                    resolve({ ok: true, text: () => Promise.resolve() });

                    return;
                }

                // delete user
                if (url.match(/\/users\/\d+$/) && opts.method === 'DELETE') {
                    // check for fake auth token in header and return user if valid, this security is implemented server side in a real application
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        // find user by id in users array
                        let urlParts = url.split('/');
                        let id = parseInt(urlParts[urlParts.length - 1]);
                        for (let i = 0; i < users.length; i++) {
                            let user = users[i];
                            if (user.id === id) {
                                // delete user
                                users.splice(i, 1);
                                localStorage.setItem('users', JSON.stringify(users));
                                break;
                            }
                        }

                        // respond 200 OK
                        resolve({ ok: true, text: () => Promise.resolve() });
                    } else {
                        // return 401 not authorised if token is null or invalid
                        reject('Unauthorised');
                    }

                    return;
                }

                // delete model
                if (url.match(/\/models\/\d+$/) && opts.method === 'DELETE') {
                    if (opts.headers && opts.headers.Authorization === 'Bearer fake-jwt-token') {
                        let urlParts = url.split('/');
                        let id = parseInt(urlParts[urlParts.length - 1]);
                        let modelname = '';
                        for (let i = 0; i < models.length; i++) {
                            let model = models[i];
                            if (model.id === id) {
                                modelname = model.modelname;
                                models.splice(i, 1);
                                localStorage.setItem('models', JSON.stringify(models));
                                break;
                            }
                        }
                        for(let i = 0; i < users.length; i++)
                        {
                            for(let j = 0; j < users[i].model_selections.length; j++)
                            {
                                if(users[i].model_selections[j].name === modelname)
                                {
                                    users[i].model_selections.splice(j,1);
                                    localStorage.setItem('users', JSON.stringify(users));
                                }
                            }
                        }

                        // respond 200 OK
                        resolve({ ok: true, text: () => Promise.resolve() });
                    } else {
                        // return 401 not authorised if token is null or invalid
                        reject('Unauthorised');
                    }

                    return;
                }

                // pass through any requests not handled above
                realFetch(url, opts).then(response => resolve(response));

            }, 500);
        });
    }
}