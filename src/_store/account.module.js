import { userService } from '../_services';
import { router } from '../_helpers';

const user = JSON.parse(localStorage.getItem('user'));
const state = user
    ? { status: { loggedIn: true }, user }
    : { status: {}, user: null };

const actions = {
    login({ dispatch, commit }, { username, password }) {
        commit('loginRequest', { username });
    
        userService.login(username, password)
            .then(
                user => {
                    commit('loginSuccess', user);
                    if(username === 'admin')
                        router.push('/admin');
                    else
                        router.push('/');
                },
                error => {
                    commit('loginFailure', error);
                    dispatch('alert/error', error, { root: true });
                }
            );
    },
    logout({ commit }) {
        userService.logout();
        commit('logout');
    },
    register({ dispatch, commit }, user) {
        commit('registerRequest', user);
    
        userService.register(user)
            .then(
                user => {
                    commit('registerSuccess', user);
                    router.push('/login');
                    setTimeout(() => {
                        // display success message after route change completes
                        dispatch('alert/success', 'Registration successful', { root: true });
                    })
                },
                error => {
                    commit('registerFailure', error);
                    dispatch('alert/error', error, { root: true });
                }
            );
    },
    updatepersonalinfo({ dispatch, commit }, {r1,r2,r3,r4,r5,status,role, id})
    {
        userService.updatepersonalinfo(r1,r2,r3,r4,r5,status,role, id).then(
            user => {
                commit('loginSuccess', user);
            },
            error => {
                commit('loginFailure', error);
                dispatch('alert/error', error, { root: true });
            }
        );
    },
    addselections({ dispatch, commit }, {id ,selected_list, selected_list_name,disselected_list, disselected_list_name, name}) {
        userService.addselections(id, selected_list, selected_list_name,disselected_list, disselected_list_name, name).then(
            user => {
                commit('loginSuccess', user);
            },
            error => {
                commit('loginFailure', error);
                dispatch('alert/error', error, { root: true });
            }
        );
    },
    updateuser({ dispatch, commit })
    {
        userService.updateuser(user).then(
            user => {
                commit('loginSuccess', user);
            },
            error => {
                commit('loginFailure', error);
                dispatch('alert/error', error, { root: true });
            }
        );
    }
};

const mutations = {
    loginRequest(state, user) {
        state.status = { loggingIn: true };
        state.user = user;
    },
    loginSuccess(state, user) {
        state.status = { loggedIn: true };
        state.user = user;
    },
    loginFailure(state) {
        state.status = {};
        state.user = null;
    },
    logout(state) {
        state.status = {};
        state.user = null;
    },
    registerRequest(state, user) {
        state.status = { registering: true };
    },
    registerSuccess(state, user) {
        state.status = {};
    },
    registerFailure(state, error) {
        state.status = {};
    }
};

export const account = {
    namespaced: true,
    state,
    actions,
    mutations
};