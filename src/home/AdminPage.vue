<template>
    <div>
        <h3>Stakeholders from secure api end point:</h3>
        <em v-if="users.loading">Loading stakeholders...</em>
        <span v-if="users.error" class="text-danger">ERROR: {{users.error}}</span>
        <ul v-if="users.items">
            <li v-for="user in users.items" :key="user.id">
                {{user.firstName + ' ' + user.lastName}}
                <span v-if="user.deleting"><em> - Deleting...</em></span>
                <span v-else-if="user.deleteError" class="text-danger"> - ERROR: {{user.deleteError}}</span>
                <span v-else> - <a @click="deleteUser(user.id)" class="text-danger">Delete</a></span>
            </li>
        </ul>
        <h3>Models from secure api end point:</h3>
        <em v-if="models.loading">Loading models...</em>
        <span v-if="models.error" class="text-danger">ERROR: {{models.error}}</span>
        <ul v-if="models.items">
            <li v-for="model in models.items" :key="model.id">
                {{model.modelname}}
                <span v-if="model.deleting"><em> - Deleting...</em></span>
                <span v-if="model.merging"><em> - Merging...</em></span>
                <span v-else-if="model.deleteError" class="text-danger"> - ERROR: {{model.deleteError}}</span>
                <span v-else> 
                    -
                    <a @click="currentmodelname = model.modelname;updatecurrentuser();" class="text-danger" data-toggle="modal" data-target="#mergeModal">Merge</a>
                    - 
                    <a @click="deleteModel(model.id)" class="text-danger">Delete</a>
                </span>
            </li>
        </ul>
        <div class="modal fade" id="mergeModal" tabindex="-1" role="dialog" aria-labelledby="mergeModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="mergeModalTitle">List of stakeholders</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            Please select one critical stakeholder:  
                            <select v-model="critical_user" >
                                <option disabled value="">Select</option>
                                <option v-for="user in currentuser" :key="user.id">
                                    {{user.firstName}} {{user.lastName}}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <input type="checkbox" v-model="applytoallusers"/>Send the final configuration to all the stakeholders.<br/>
                        </div>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th scope="col">First Name</th>
                                    <th scope="col">Last Name</th>
                                    <th scope="col">R1</th>
                                    <th scope="col">R2</th>
                                    <th scope="col">R3</th>
                                    <th scope="col">R4</th>
                                    <th scope="col">R5</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Role</th>
                                    <th scope="col">Desired features</th>
                                    <th scope="col">Undesired features</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in currentuser" :key="user.id">
                                    <td>
                                        {{user.firstName}}
                                    </td>
                                    <td>
                                        {{user.lastName}}
                                    </td>
                                    <td>
                                        <i :class="[user.MCS.r1?'fas fa-check':'fas fa-times']"></i>
                                    </td>
                                    <td>
                                        <i :class="[user.MCS.r2?'fas fa-check':'fas fa-times']"></i>
                                    </td>
                                    <td>
                                        <i :class="[user.MCS.r3?'fas fa-check':'fas fa-times']"></i>
                                    </td>
                                    <td>
                                        <i :class="[user.MCS.r4?'fas fa-check':'fas fa-times']"></i>
                                    </td>
                                    <td>
                                        <i :class="[user.MCS.r5?'fas fa-check':'fas fa-times']"></i>
                                    </td>
                                    <td>{{user.status}}</td>
                                    <td>{{user.role}}</td>
                                    <td>
                                        {{getselections(user.model_selections)}}
                                    </td>
                                    <td>
                                        {{getdisselections(user.model_selections)}}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="startmerge();applytoallusers=false;">Start resolution</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="resultModal" tabindex="-1" role="dialog" aria-labelledby="resultModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="resultModalTitle">Final configuration</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <span>Rule{{resultmessage}} applied. The computing of MCS costs {{runtime}} ms.</span>
                        {{MCSmessage}}
                        <div style="height:400px">
                            <subcotalogue ref="tree"></subcotalogue>
                        </div>
                    </div>
                    <div class="modal-footer">
                    </div>
                </div>
            </div>  
        </div>
        <p>
            <router-link to="/login">Logout</router-link>
        </p>
    </div>
</template>

<script>
// import axios from "axios";
import { mapState, mapActions } from 'vuex'
import subcotalogue from './sub_cotalogue.vue'

export default {
    data (){
        return{
            critical_user:'',
            currentmodelname:'',
            conflict_results:[],
            currentuser:{},
            applytoallusers: false,
            runtime:'',
            resultmessage:'',
            MCSmessage:''
        }
    },
    components:{
        subcotalogue,
    },
    computed: {
        ...mapState({
            users: state => state.users.all,
            models: state => state.models.all
        })
    },
    created () {
        this.getAllUsers();
        this.getAllModels();
    },
    methods: {
        updatecurrentuser(){
            let temp = {...this.users.items};
            for(let key in temp)
            {
                if(this.getselections(temp[key].model_selections) === '')
                    delete temp[key];
                else if(this.getdisselections(temp[key].model_selections) === '')
                    delete temp[key];
            }
            this.currentuser = {...temp};
        },
        ...mapActions('users', {
            getAllUsers: 'getAll',
            deleteUser: 'delete',
            applyallcurrentusers: 'applyAll'
        }),
        ...mapActions('models', {
            getAllModels: 'getAll',
            deleteModel: 'delete'
        }),
        getselections(model_selections){
            if(model_selections !== undefined)
            {
                for(let i = 0; i < model_selections.length; i++)
                {
                    if(model_selections[i].name === this.currentmodelname)
                        return model_selections[i].selections_name;
                }
            }
            return '';
        },
        getdisselections(model_selections){
            if(model_selections !== undefined)
            {
                for(let i = 0; i < model_selections.length; i++)
                {
                    if(model_selections[i].name === this.currentmodelname)
                        return model_selections[i].disselections_name;
                }
            }
            return '';
        },
        startmerge(){
            this.$refs.tree.data = [];
            this.runtime = '';
            this.resultmessage = '';
            var moment = require('moment');
            this.runtime = moment().valueOf();
            let xmlobject = {};
            for(let i = 0; i < this.models.items.length; i++)
            {
                if(this.models.items[i].modelname === this.currentmodelname)
                {
                    xmlobject = this.models.items[i].xml;
                }
            }
            if(this.critical_user === '')
            {
                alert('Please select one critical stakeholder!');
                return;
            }
            this.conflict_results = [];
            let select_list = [];
            let unselect_list = [];
            for(let i = 0; i < this.users.items.length; i++)
            {
                for(let j = 0; j < this.users.items[i].model_selections.length; j++)
                {
                    if(this.users.items[i].model_selections[j].name === this.currentmodelname)
                    {
                        for(let k = 0; k < this.users.items[i].model_selections[j].selections_name.length; k++)
                        {
                            if(!select_list.includes(this.users.items[i].model_selections[j].selections_name[k]))
                                select_list.push(this.users.items[i].model_selections[j].selections_name[k]);
                        }
                        for(let k = 0; k < this.users.items[i].model_selections[j].disselections_name.length; k++)
                        {
                            if(!unselect_list.includes(this.users.items[i].model_selections[j].disselections_name[k]))
                                unselect_list.push(this.users.items[i].model_selections[j].disselections_name[k]);
                        }
                    }
                }
            }

            this.$refs.tree.xml = xmlobject;
            this.$refs.tree.mainprocess();

            for(let i = 0 ; i < this.$refs.tree.data.length; i++)
            {
                if(unselect_list.includes(this.$refs.tree.data[i].data.nodeName))
                {
                    this.$refs.tree.data[i].data.tick = false;
                    this.$refs.tree.data[i].data.default_tick = true;
                }
                if(select_list.includes(this.$refs.tree.data[i].data.nodeName))
                {
                    this.$refs.tree.data[i].data.tick = true;
                    this.$refs.tree.data[i].data.default_tick = true;
                }
            }

            for(let i = 0; i < this.$refs.tree.data.length; i++)
            {
                if(this.$refs.tree.data[i].data.type === 'alt')
                {
                    if(this.getxorconflicts(this.$refs.tree.data, this.$refs.tree.data[i].data.nodeId,select_list) !== null)
                        this.conflict_results.push(this.getxorconflicts(this.$refs.tree.data, this.$refs.tree.data[i].data.nodeId, select_list));
                }
            }
            this.getconstraintconflicts(xmlobject, this.$refs.tree.data, select_list, unselect_list);
            
            //get MCS
            let MCS = [];
            if(this.conflict_results.length !== 0)
                MCS = this.computeMCS();
            if(MCS.length === 0)
                alert('No conflicts');
            else
                alert('Conflict detected.\nThe list of MCS is:\n' + JSON.stringify(MCS));
            /**
             * @todo show final MCS
             */
            //choose one solution
            if(MCS.length !== 0)
            {
                this.MCSmessage = '\nThe list of MCS is:\n' + JSON.stringify(MCS);
                let allusers = this.currentuser;
                let r1 = false;
                let r2 = false;
                let r3 = false;
                let r4 = false;
                let r5 = false;
                let results = [];
                for(let key in allusers)
                {
                    if(allusers[key].MCS.r1)
                        r1 = true;
                    if(allusers[key].MCS.r2)
                        r2 = true;
                    if(allusers[key].MCS.r3)
                        r3 = true;
                    if(allusers[key].MCS.r4)
                        r4 = true;
                    if(allusers[key].MCS.r5)
                        r5 = true;
                }
                if(r2)
                {
                    results.push(this.getsolution1(MCS));
                    this.resultmessage+=' 1';
                }
                if(r1)
                {
                    results.push(this.getsolution2(MCS));
                    this.resultmessage+=' 2';
                }
                if(r3)
                {
                    let sol3 = this.getsolution3(MCS);
                    if(sol3 !== '')
                    {
                        results.push(sol3);
                        this.resultmessage+=' 3';
                    }
                }
                if(r4)
                {
                    let sol4 = this.getsolution4(MCS);
                    if(sol4 !== '')
                    {
                        results.push(sol4);
                        this.resultmessage+=' 4';
                    }
                }
                if(r5)
                {
                    let sol5 = this.getsolution5(MCS);
                    if(sol5 !== '')
                    {
                        results.push(sol5);
                        this.resultmessage+=' 5';
                    }
                }
                // if(r4)
                // {
                //     this.resultmessage+=' 4';
                //     let sol4 = this.getsolution4(MCS);
                //     if(sol4 !== '')
                //         this.$set(results, sol4);
                // }
                // if(r5)
                //     this.$set(results, this.getsolution5(MCS));
                if(results.length === 1)
                {
                    this.applytotree(results[0]);
                }
                else
                {
                    let compareresult = '';
                    if(results.length !== 0)
                        compareresult = this.checkonecommon(results);
                    // MCS = this.computeMCS();
                    // let sol3 = this.getsolution3(MCS);
                    // if(sol3 !== '' && MCS.length !== 0)
                    // {
                    //     this.$set(results, sol3);
                    //     this.applytotree(JSON.stringify(Object.keys(results)));
                    //     this.resultmessage = ' history';
                    // }
                    // else
                    if(compareresult === '')
                    {
                        let critical_selections = [];
                        let critical_disselections = [];
                        for(let key in allusers)
                        {
                            if(this.critical_user === allusers[key].firstName + ' ' + allusers[key].lastName)
                            {
                                critical_selections = this.getselections(allusers[key].model_selections);
                                critical_disselections = this.getdisselections(allusers[key].model_selections);
                            }
                        }
                        for(let i = 0; i < this.$refs.tree.data.length; i++)
                        {
                            if(critical_selections.includes(this.$refs.tree.data[i].data.nodeName))
                            {
                                this.$refs.tree.data[i].data.tick = true;
                                this.$refs.tree.data[i].data.default_tick = true;
                            }
                            else if(critical_disselections.includes(this.$refs.tree.data[i].data.nodeName))
                            {
                                this.$refs.tree.data[i].data.tick = false;
                                this.$refs.tree.data[i].data.default_tick = true;
                            }
                            else
                            {
                                this.$refs.tree.data[i].data.tick = false;
                                this.$refs.tree.data[i].data.default_tick = false;
                            }
                        }
                        if(this.applytoallusers)
                            this.updateallusersolution(critical_selections,critical_disselections);
                        this.resultmessage = ' super stakeholder';
                    }
                    else
                    {
                        this.applytotree(compareresult);
                    }
                }
            }
            else
            {
                this.MCSmessage = '';
                this.resultmessage = ' null';
            }
            this.runtime = moment().valueOf() - this.runtime;
            
            $('#mergeModal').modal('toggle');
            $('#resultModal').modal('show');
            this.$refs.tree.showupload = false;
            this.critical_user = '';
            this.applytoallusers = false;
        },
        getconstraintconflicts(xmlobject, data, select_list, unselect_list)
        {
            let rel_lists = ['rel_abstract_root','rel_abstract_abstract','rel_concrete_root','rel_concrete_abstract','rel_concrete_concrete'];
			for(let x = 0; x < rel_lists.length; x++)
			{
				if(xmlobject.mxGraphModel.root[rel_lists[x]] !== undefined)
				{
					if(Array.isArray(xmlobject.mxGraphModel.root[rel_lists[x]]))
					{
						for(let i = 0; i < xmlobject.mxGraphModel.root[rel_lists[x]].length; i++)
						{
							if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@parent'] === 'feature')
							{
								if(xmlobject.mxGraphModel.root[rel_lists[x]][i]['@relType'] === 'requires')
								{
                                    let source = '';
                                    let target = '';
									for(let k = 0; k < data.length; k++)
									{
                                        if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@source'] === data[k].data.nodeId)
										{
											source = data[k].data.nodeName;	
										}
										if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@target'] === data[k].data.nodeId)
										{
											target = data[k].data.nodeName;	
										}
                                    }
                                    if(select_list.includes(source) && unselect_list.includes(target))
                                    {
                                        let requires = [];
                                        requires.push(target);//require part only considers target
                                        requires.push("!"+target);
                                        this.conflict_results.push(requires);
                                    }
                                }	
								else if(xmlobject.mxGraphModel.root[rel_lists[x]][i]['@relType'] === 'excludes')
								{
                                    let source = '';
                                    let target = '';
									for(let k = 0; k < data.length; k++)
									{
                                        if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@source'] === data[k].data.nodeId)
										{
											source = data[k].data.nodeName;	
										}
										if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@target'] === data[k].data.nodeId)
										{
											target = data[k].data.nodeName;	
										}
                                    }
                                    if(select_list.includes(source) && select_list.includes(target))
                                    {
                                        let requires = [];
                                        requires.push(source);
                                        requires.push(target);
                                        this.conflict_results.push(requires);
                                    }
								}
							}
						}
					}
				    else
					{
						if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@parent'] === 'feature')
						{
							if(xmlobject.mxGraphModel.root[rel_lists[x]]['@relType'] === 'requires')
							{
                                let source = '';
                                let target = '';
								for(let k = 0; k < data.length; k++)
								{
                                    if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@source'] === data[k].data.nodeId)
									{
										source = data[k].data.nodeName;	
									}
									if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@target'] === data[k].data.nodeId)
									{
										target = data[k].data.nodeName;	
									}
                                }
                                if(select_list.includes(source) && unselect_list.includes(target))
                                {
                                    let requires = [];
                                    requires.push(target);//require part only considers target
                                    requires.push("!"+target);
                                    this.conflict_results.push(requires);
                                }
							}	
							else if(xmlobject.mxGraphModel.root[rel_lists[x]]['@relType'] === 'excludes')
							{
                                let source = '';
                                let target = '';
								for(let k = 0; k < data.length; k++)
								{
                                    if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@source'] === data[k].data.nodeId)
									{
										source = data[k].data.nodeName;	
									}
									if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@target'] === data[k].data.nodeId)
									{
										target = data[k].data.nodeName;	
									}
                                }
                                if(select_list.includes(source) && select_list.includes(target))
                                {
                                    let requires = [];
                                    requires.push(source);
                                    requires.push(target);
                                    this.conflict_results.push(requires);
                                }
							}
						}
					}
                }
            }
        },
        getxorconflicts(data, parentid, select_list)
        {
            let xorresults = [];
            for(let i = 0; i < data.length; i++)
            {
                if(data[i].data.parentId === parentid && select_list.includes(data[i].data.nodeName))
                    xorresults.push(data[i].data.nodeName);
            }
            if(xorresults.length < 2)
                return null;
            return xorresults;
        },
        computeMCS(){
            let cache = [];
            let MCS = [];
            for(let i = 0 ; i < this.conflict_results.length; i++)
            {
                for(let j = 0; j < this.conflict_results[i].length; j++)
                {
                    if(this.conflict_results[i][j].charAt(0) === '!')
                    {
                        if(!cache.includes(this.conflict_results[i][j].substring(1)))
                            cache.push(this.conflict_results[i][j].substring(1));
                        this.conflict_results[i][j] = this.conflict_results[i][j].substring(1);
                    }
                    else
                    {
                        if(!cache.includes(this.conflict_results[i][j]))
                            cache.push(this.conflict_results[i][j]);
                        this.conflict_results[i][j] = '!' + this.conflict_results[i][j];
                    }
                }
            }
            for(let i = 0 ; i < cache.length; i++)
            {
                let temp = MCS;
                if(temp.length === 0)
                {
                    let temp1 = [];
                    let temp2 = [];
                    if(cache[i].charAt(0) === '!')
                    {
                        temp1.push(cache[i].substring(1));
                        temp2.push(cache[i]);
                    }
                    else
                    {
                        temp1.push(cache[i]);
                        temp2.push('!'+cache[i]);
                    }
                    MCS.push(temp1);
                    MCS.push(temp2);
                }
                else
                {
                    MCS = [];
                    for(let j = 0; j < temp.length; j++)
                    {
                        let tempj = temp[j];
                        let temp1 = [...tempj];
                        let temp2 = [...tempj];
                        if(cache[i].charAt(0) === '!')
                        {
                            temp1.push(cache[i].substring(1));
                            temp2.push(cache[i]);
                        }
                        else
                        {
                            temp1.push(cache[i]);
                            temp2.push('!'+cache[i]);
                        }
                        if(temp1.length !== 0)
                            MCS.push(temp1);
                        if(temp2.length !== 0)
                            MCS.push(temp2);
                    }
                }
            }
            let delete_num = [];
            for(let i = 0; i < MCS.length; i++)
            {
                for(let j = 0; j < this.conflict_results.length; j++)
                {
                    let num = this.conflict_results[j].length;
                    for(let k = 0 ; k < this.conflict_results[j].length; k++)
                    {
                        if(MCS[i].includes(this.conflict_results[j][k]))
                            num--;
                    }
                    if(num === 0 && !delete_num.includes(i))
                        delete_num.unshift(i);
                }
            }
            for(let i = 0; i < delete_num.length; i++)
            {
                MCS.splice(delete_num[i],1);
            }
            return MCS;
        },
        getsolution1(MCS){
            let index = '';
            let maxlength = 0;
            let result = [];
            for(let i = 0; i < MCS.length; i++)
            {
                let currentlength = 0;
                for(let j = 0; j < MCS[i].length; j++)
                {
                    if(MCS[i][j].indexOf('!') === -1)
                    {
                        currentlength++;
                    }
                }
                if(currentlength > maxlength)
                {
                    maxlength = currentlength;
                    index = i;
                }
            }
            for(let i = 0; i < MCS.length; i++)
            {
                let currentlength = 0;
                for(let j = 0; j < MCS[i].length; j++)
                {
                    if(MCS[i][j].indexOf('!') === -1)
                    {
                        currentlength++;
                    }
                }
                if(maxlength === currentlength)
                    result.push(MCS[i]);
            }
            return result;
        },
        getsolution2(MCS){
            let index = '';
            let maxlength = 0;
            let result = [];
            for(let i = 0; i < MCS.length; i++)
            {
                let currentlength = 0;
                for(let j = 0; j < MCS[i].length; j++)
                {
                    if(MCS[i][j].indexOf('!') !== -1)
                    {
                        currentlength++;
                    }
                }
                if(currentlength > maxlength)
                {
                    maxlength = currentlength;
                    index = i;
                }
            }
            for(let i = 0; i < MCS.length; i++)
            {
                let currentlength = 0;
                for(let j = 0; j < MCS[i].length; j++)
                {
                    if(MCS[i][j].indexOf('!') !== -1)
                    {
                        currentlength++;
                    }
                }
                if(maxlength === currentlength)
                    result.push(MCS[i]);
            }
            return result;
        },
        getsolution3(MCS){
            let result = [];
            let modelitem = {};
            for(let i = 0; i < this.models.items.length; i++)
            {
                if(this.models.items[i].modelname === this.currentmodelname)
                {
                    modelitem = this.models.items[i];
                }
            }
            if(modelitem.history.length !== 0)
            {
                for(let i = 0; i < modelitem.history.length; i++)
                {
                    for(let j = 0; j < MCS.length; j++)
                    {
                        let checkpoint = 0;
                        for(let k = 0; k < MCS[j].length; k++)
                        {
                            if(MCS[j][k].indexOf('!') !== -1 && modelitem.history[i].selections_name.includes(MCS[j][k].substring(1)))
                            {
                                checkpoint++;
                            }
                            else if(MCS[j][k].indexOf('!') === -1 && modelitem.history[i].disselections_name.includes(MCS[j][k]))
                            {
                                checkpoint++;
                            }
                        }
                        if(checkpoint === MCS[j].length)
                        {
                            result.push(MCS[j]);
                        }
                    }
                }
            }
            if(result.length !== 0)
                return result;
            return '';
        },
        getsolution4(MCS){
            let result = [];
            let allusers = this.currentuser;
            let tempprofile = [];
            for(let key in allusers)
            {
                if(allusers[key].MCS.r4 && !tempprofile.includes(allusers[key].role + '+' + allusers[key].status))
                    tempprofile.push(allusers[key].role + '+' + allusers[key].status);
            }
            for(let i = 0; i < tempprofile.length; i++)
            {
                for(let key in allusers)
                {
                    if(allusers[key].role === tempprofile[i].split('+')[0] && allusers[key].status === tempprofile[i].split('+')[1])
                    {
                        for(let j = 0; j < allusers[key].model_selections.length; j++)
                        {
                            if(allusers[key].model_selections[j].name === this.currentmodelname)
                            {
                                for(let k = 0; k < allusers[key].model_selections[j].history.length; k++)
                                {
                                    for(let a = 0; a < MCS.length; a++)
                                    {
                                        let checkpoint = 0;
                                        for(let b = 0; b < MCS[a].length; b++)
                                        {
                                            if(MCS[a][b].indexOf('!') !== -1 && allusers[key].model_selections[j].history[k].selections_name.includes(MCS[a][b].substring(1)))
                                            {
                                                checkpoint++;
                                            }
                                            else if(MCS[a][b].indexOf('!') === -1 && allusers[key].model_selections[j].history[k].disselections_name.includes(MCS[a][b]))
                                            {
                                                checkpoint++;
                                            }
                                        }
                                        if(checkpoint === MCS[a].length)
                                        {
                                            result.push(MCS[a]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(result.length !== 0)
                return result;
            return '';
        },
        getsolution5(MCS){
            let result = [];
            let allusers = this.currentuser;

            for(let key in allusers)
            {
                if(allusers[key].MCS.r5)
                {
                    for(let i = 0; i < allusers[key].model_selections.length; i++)
                    {
                        if(allusers[key].model_selections[i].name === this.currentmodelname)
                        {
                            for(let j = 0; j < MCS.length; j++)
                            {
                                let checkpoint = 0;
                                for(let k = 0; k < MCS[j].length; k++)
                                {
                                    if(MCS[j][k].indexOf('!') !== -1 && allusers[key].model_selections[i].selections_name.includes(MCS[j][k].substring(1)))
                                    {
                                        checkpoint++;
                                    }
                                    else if(MCS[j][k].indexOf('!') === -1 && allusers[key].model_selections[i].disselections_name.includes(MCS[j][k]))
                                    {
                                        checkpoint++;
                                    }
                                }
                                if(checkpoint === MCS[j].length)
                                {
                                    result.push(MCS[j]);
                                }
                            }       
                        }
                    }
                }
            }
            if(result.length !== 0)
                return result;
            return '';
        },
        // return the final solutions to all the users
        updateallusersolution(selections, disselections){
            let selected_list = [];
            let disselected_list = [];
            for(let i = 0; i < this.$refs.tree.data.length; i++)
            {  
                if(selections.includes(this.$refs.tree.data[i].data.nodeName))
                    selected_list.push(this.$refs.tree.data[i].data.nodeId);
                if(disselections.includes(this.$refs.tree.data[i].data.nodeName))
                    disselected_list.push(this.$refs.tree.data[i].data.nodeId);
            }   

            let allusers = this.currentuser;
            let name = this.currentmodelname;
            let id = [];
            for(let key in allusers)
            {
                id.push(allusers[key].id);
            }
            this.applyallcurrentusers({id ,selected_list, selections, disselected_list, disselections, name});
        },
        applytotree(results)
        {
            // let solutions = [];
            //         solutions.push(results.split(',')[0].split('["')[1]);
            //         for(let i = 1; i < results.split(',').length-1; i++)
            //         {
            //             solutions.push(results.split(',')[i]);
            //         }
            //         solutions.push(results.split(',')[results.split(',').length-1].split('"]')[0]);
            alert('The final selected MCS is ' + results[0]);
            for(let i = 0 ; i < results[0].length; i++)
            {
                if(results[0][i].indexOf('!') !== -1)
                {
                    for(let j = 0; j < this.$refs.tree.data.length; j++)
                    {
                        if(this.$refs.tree.data[j].data.nodeName === results[0][i].substring(1))
                        {
                            this.$refs.tree.data[j].data.tick = true;
                            this.$refs.tree.data[j].data.default_tick = true;
                            this.$refs.tree.itemclick(j);
                        }
                    }
                }
                else
                {
                    for(let j = 0; j < this.$refs.tree.data.length; j++)
                    {
                        if(this.$refs.tree.data[j].data.nodeName === results[0][i])
                        {
                            this.$refs.tree.data[j].data.tick = false;
                            this.$refs.tree.data[j].data.default_tick = true;
                            this.$refs.tree.itemclick(j);
                        }
                    }
                }
            }
            let final_select_list = [];
            let final_unselect_list = [];
            for(let i = 0; i < this.$refs.tree.data.length; i++)
            {
                if(this.$refs.tree.data[i].data.tick && this.$refs.tree.data[i].data.default_tick)
                    final_select_list.push(this.$refs.tree.data[i].data.nodeName);
                if(!this.$refs.tree.data[i].data.tick && this.$refs.tree.data[i].data.default_tick)
                    final_unselect_list.push(this.$refs.tree.data[i].data.nodeName);
            }
            if(this.applytoallusers)
                this.updateallusersolution(final_select_list,final_unselect_list);
        },
        checkonecommon(results)
        {
            let count = 0;
            let common = [];
            for(let i = 0; i < results[0].length; i++)
            {
                let checkpoint = true;
                for(let j = 1; j < results.length; j++)
                {
                    if(JSON.stringify(results[j]).indexOf(results[0][i]) === -1)
                        checkpoint = false;
                }
                if(checkpoint)
                {
                    count++;
                    common.push(results[0][i]);
                }
            }
            if(count !== 1)
                return '';
            return common;
        }
    }
};
</script>

<style scoped>
td {
  word-break: break-all;
}

.modal-body {
    overflow-y: auto;
}
</style>