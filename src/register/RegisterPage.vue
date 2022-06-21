<template>
    <div>
        <h2>Stakeholder Register</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" v-model="user.firstName" v-validate="'required'" name="firstName" class="form-control" :class="{ 'is-invalid': submitted && errors.has('firstName') }" />
                <div v-if="submitted && errors.has('firstName')" class="invalid-feedback">{{ errors.first('firstName') }}</div>
            </div>
            <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" v-model="user.lastName" v-validate="'required'" name="lastName" class="form-control" :class="{ 'is-invalid': submitted && errors.has('lastName') }" />
                <div v-if="submitted && errors.has('lastName')" class="invalid-feedback">{{ errors.first('lastName') }}</div>
            </div>
            <div class="form-group">
                <label for="username">Loginname</label>
                <input type="text" v-model="user.username" v-validate="'required'" name="loginname" class="form-control" :class="{ 'is-invalid': submitted && errors.has('loginname') }" />
                <div v-if="submitted && errors.has('loginname')" class="invalid-feedback">{{ errors.first('loginname') }}</div>
            </div>
            <div class="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" v-model="user.password" v-validate="{ required: true, min: 6 }" name="password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('password') }" />
                <div v-if="submitted && errors.has('password')" class="invalid-feedback">{{ errors.first('password') }}</div>
            </div>
            <div class="form-group">
                 <span>Status:</span>
                <select v-model="user.status" v-validate="'required'" name="status" class="form-control" :class="{ 'is-invalid': submitted && errors.has('status') }">
                    <option disabled value="">Select</option>
                    <option>Expert</option>
                    <option>Novice</option>
                </select>
                <div v-if="submitted && errors.has('status')" class="invalid-feedback">{{ errors.first('status') }}</div>
            </div>
            <div class="form-group">
                <span>Role:</span>
                <select v-model="user.role" v-validate="'required'" name="role" class="form-control" :class="{ 'is-invalid': submitted && errors.has('role') }">
                    <option disabled value="">Select</option>
                    <option>Engineer</option>
                    <option>Product Manager</option>
                    <option>Saler</option>
                    <option>Customer</option>
                    <option>User</option>
                </select>
                <div v-if="submitted && errors.has('role')" class="invalid-feedback">{{ errors.first('role') }}</div>
            </div>
            <div class="form-group">
                <label for="regle">Substitution rules :</label> <br/>
                <input type="checkbox" v-model="user.MCS.r1"/>SR1: Most complete product (Full option) <br/>
                <input type="checkbox" v-model="user.MCS.r2"/>SR2: Simplest product (Minimum of options) <br/>
                <input type="checkbox" v-model="user.MCS.r3"/>SR3: Product similar to a past configuration <br/>
                <input type="checkbox" v-model="user.MCS.r4"/>SR4: Product configured by a similar profile <br/>
                <input type="checkbox" v-model="user.MCS.r5"/>SR5: Prioritize my explicit configuration decisions <br/>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="status.registering">Register</button>
                <img v-show="status.registering" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                <router-link to="/login" class="btn btn-link">Cancel</router-link>
            </div>
        </form>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
    data () {
        return {
            user: {
                firstName: '',
                lastName: '',
                username: '',
                password: '',
                MCS:{
                    r1: false,
                    r2: false,
                    r3: false,
                    r4: false,
                    r5: false
                },
                status: '',
                role: '',
                model_selections: []
            },
            submitted: false
        }
    },
    computed: {
        ...mapState('account', ['status'])
    },
    methods: {
        ...mapActions('account', ['register']),
        handleSubmit(e) {
            this.submitted = true;
            this.$validator.validate().then(valid => {
                if (valid) {
                    this.register(this.user);
                }
            });
        }
    }
};
</script>