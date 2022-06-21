<template>
    <div>
        <div class="form-group">
            <h1>Hi {{account.user.firstName}}!</h1>
        </div>
        <div class="form-group">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th scope="col">R1</th>
                        <th scope="col">R2</th>
                        <th scope="col">R3</th>
                        <th scope="col">R4</th>
                        <th scope="col">R5</th>
                        <th scope="col">Status</th>
                        <th scope="col">Role</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="!modifyuser">
                        <td>
                            <i :class="[account.user.r1?'fas fa-check':'fas fa-times']"></i>
                        </td>
                        <td>
                            <i :class="[account.user.r2?'fas fa-check':'fas fa-times']"></i>
                        </td>
                        <td>
                            <i :class="[account.user.r3?'fas fa-check':'fas fa-times']"></i>
                        </td>
                        <td>
                            <i :class="[account.user.r4?'fas fa-check':'fas fa-times']"></i>
                        </td>
                        <td>
                            <i :class="[account.user.r5?'fas fa-check':'fas fa-times']"></i>
                        </td>
                        <td>{{account.user.status}}</td>
                        <td>{{account.user.role}}</td>
                    </tr>
                    <tr v-if="modifyuser">
                        <td>
                            <input type="checkbox" v-model="r1"/>
                        </td>
                        <td>
                            <input type="checkbox" v-model="r2"/>
                        </td>
                        <td>
                            <input type="checkbox" v-model="r3"/>
                        </td>
                        <td>
                            <input type="checkbox" v-model="r4"/>
                        </td>
                        <td>
                            <input type="checkbox" v-model="r5"/>
                        </td>
                        <td>
                            <select v-model="status">
                                <option>Expert</option>
                                <option>Novice</option>
                            </select>
                        </td>
                        <td>
                            <select v-model="role">
                                <option>Engineer</option>
                                <option>Product Manager</option>
                                <option>Saler</option>
                                <option>Customer</option>
                                <option>User</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="form-group">
            <label v-if="!modifyuser">Change the personal information:</label>
            <button v-if="!modifyuser" @click="changeuser()">Change</button>
            <button v-if="modifyuser" @click="modifyuser = !modifyuser;updateuser();">Save</button>
            <button v-if="modifyuser" @click="modifyuser = !modifyuser">Cancel</button>
        </div>
        <div class="form-group">
            <subcotalogue></subcotalogue>
        </div>
        <div class="form-group">
            <p>
                <router-link to="/login">Logout</router-link>
            </p>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions} from 'vuex'
import subcotalogue from './sub_cotalogue.vue'

export default {
    data () {
        return {
            modifyuser: false,
            r1: false,
            r2: false,
            r3: false,
            r4: false,
            r5: false,
            status: '',
            role: ''
        }
    },
    components:{
        subcotalogue,
    },
    computed: {
        ...mapState({
            account: state => state.account
        })
    },
    methods: {
        ...mapActions('account', ['updatepersonalinfo']),
        changeuser(){
            this.modifyuser = !this.modifyuser;
            this.r1 = this.account.user.r1;
            this.r2 = this.account.user.r2;
            this.r3 = this.account.user.r3;
            this.r4 = this.account.user.r4;
            this.r5 = this.account.user.r5;
            this.status = this.account.user.status;
            this.role = this.account.user.role;
        },
        updateuser(){
            let id = this.account.user.id;
            const {r1,r2,r3,r4,r5,status,role} = this;
            this.updatepersonalinfo({r1,r2,r3,r4,r5,status,role, id});
        }
    }
};
</script>

<style scoped>

</style>