import { userService } from '../_services';

const state = {
    all: {}
};

const actions = {
    getAll({ commit }) {
        commit('getAllRequest');

        userService.getAllmodels()
            .then(
                models => commit('getAllSuccess', models),
                error => commit('getAllFailure', error)
            );
    },

    delete({ commit }, id) {
        commit('deleteRequest', id);

        userService.deletemodels(id)
            .then(
                model => commit('deleteSuccess', id),
                error => commit('deleteFailure', { id, error: error.toString() })
            );
    }
};

const mutations = {
    getAllRequest(state) {
        state.all = { loading: true };
    },
    getAllSuccess(state, models) {
        state.all = { items: models };
    },
    getAllFailure(state, error) {
        state.all = { error };
    },
    deleteRequest(state, id) {
        state.all.items = state.all.items.map(model =>
            model.id === id
                ? { ...model, deleting: true }
                : model
        )
    },
    deleteSuccess(state, id) {
        state.all.items = state.all.items.filter(model => model.id !== id)
    },
    deleteFailure(state, { id, error }) {
        state.all.items = state.items.map(model => {
            if (model.id === id) {
                const { deleting, ...modelCopy } = model;
                return { ...modelCopy, deleteError: error };
            }

            return model;
        })
    }
};

export const models = {
    namespaced: true,
    state,
    actions,
    mutations
};
