import { userService } from '../_services';
const user = JSON.parse(localStorage.getItem('user'));

const actions = {
    new_model({ dispatch, commit }, {modelname,xml, data,id}) {
        userService.addmodel(user,modelname,xml, data,id);
    },
    user_new_model({ dispatch, commit }, {modelname,id})
    {
        userService.usernewmodel(modelname, id);
    }
};

export const model = {
    namespaced: true,
    actions
};