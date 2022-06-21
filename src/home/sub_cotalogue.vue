<template>
	<div>
		<div v-if="showupload">
            <label >Please Upload your Feature Model </label>
            <input id="fileInput" type="file" @change="processFile($event)">
        </div>
	<div class="naza-tree-warp">
		<div class="naza-tree-inner show-wrap">
			<ul class="naza-tree">
				<div v-for="(item, $index) in data" :key="item.nodeId">
				<li class="naza-tree-row"
					:class="item.data.isSelected?'selected':''"
					@click="clickme($index)" v-if="checkchildnode($index)">
					
					<a :style="{paddingLeft: (20 * item.data.level) + 'px'}">
						<i
							aria-hidden="true"
							:class="[item.data.open?'fas fa-angle-down':'fas fa-angle-right']"
							@click="expand_menu($index)"
							:style="{position: 'absolute',left: (20 * item.data.level - 17) + 'px',top: '6px'}">
						</i>
						<span class="name-container"
							@dblclick="dblClick($index)">
							<i v-if="item.data.type === 'and'"
								class="fa fa-plus" aria-hidden="true"
								style="color:gray;font-size: 16px;padding-right:4px">
							</i>
							<i v-if="item.data.type === 'feature'">
							</i>
							<label class="name"
								:title="item.data.nodeName"
								:style="{display:'inline-block',
										userSelect: 'none'}">
								{{item.data.nodeName}}
							</label>
							<i v-if="item.data.mandatory !== 'true'"
								class="far fa-circle" aria-hidden="true"
								style="color:gray;font-size: 16px;padding-left:4px">
							</i>
							<i v-if="checkmandatorycircle($index)"
								class="fas fa-circle" aria-hidden="true"
								style="color:gray;font-size: 16px;padding-left:4px">
							</i>
							<div v-if="showupload" class="form-check form-check-inline" style="float:right">
								<input class="form-check-input" @click="item.data.tick = false;item.data.default_tick = true;itemclick($index);" type="radio" :name="'inlineRadioOptions' + item.data.nodeId" id="inlineRadio2" :checked="!item.data.tick && item.data.default_tick" :disabled="checkmandatorycircle($index)">
								<label class="form-check-label" for="inlineRadio2"><i class="fas fa-times" style="color:red"></i></label>
							</div>
							<div v-if="showupload" class="form-check form-check-inline" style="float:right">
								<input class="form-check-input" @click="item.data.tick = true;item.data.default_tick = true;itemclick($index);" type="radio" :name="'inlineRadioOptions' + item.data.nodeId" id="inlineRadio1" :checked="item.data.tick && item.data.default_tick" :disabled="checkmandatorycircle($index)">
								<label class="form-check-label" for="inlineRadio1"><i class="fas fa-check" style="color:green"></i></label>
							</div>
							<div v-if="!showupload && item.data.default_tick" style="float:right">
								<i :class="[item.data.tick?'fas fa-check':'fas fa-times']"></i>
							</div>
						</span>
					</a>
				</li>
				</div>
			</ul>
		</div>
	</div>
		<div v-if="xml !== '' && showupload">
			<button @click="saveclosetree()">Save and close</button>
			<button @click="closetree()">Do not save and close</button>
		</div>
	</div>
</template>
<script>
/* eslint-disable */
import Bus from '../_helpers/bus.js'
import xml2json from '../_helpers/xml2json.js'
import { mapState, mapActions } from 'vuex'
export default {
	data () {
		return {
			isloading: false,
			// the element tree data
			data: [],
			// the cache to store the hierarchical tree
			treecache: [],
			xml: '',
			modelname: '',
			id: '',
			showupload: true
		}
	},
	mounted: function() {
		Bus.$on('getxml',xml=>{
			this.modelname = xml.name;
			this.xml = xml.xmlobject;
			this.mainprocess();
			let cache = [];
			let checknewmodel = true;
			if(this.account.user.model_selections !== undefined)
			{
				for(let i = 0; i < this.account.user.model_selections.length; i++)
				{
					if(this.account.user.model_selections[i].name === this.modelname)
					{
						checknewmodel = false;
						for(let j = 0; j < this.data.length; j++)
						{
							if(this.account.user.model_selections[i].selections.includes(this.data[j].data.nodeId))
							{
								this.data[j].data.tick = true;
								this.data[j].data.default_tick = true;
							}
							else if(this.account.user.model_selections[i].disselections.includes(this.data[j].data.nodeId))
							{
								this.data[j].data.tick = false;
								this.data[j].data.default_tick = true;
							}
							else
							{
								this.data[j].data.tick = false;
								this.data[j].data.default_tick = false;
							}
						}
					}
				}
			}
			if(checknewmodel)
			{
				const { modelname} = this;
				let id = this.account.user.id;
            	if (modelname && id) {
                	this.user_new_model({modelname,id});
            	}
			}
		});
		this.mainprocess();
	},
	computed: {
        ...mapState({
            account: state => state.account
        })
    },
	methods: {
		...mapActions('account', ['addselections']),
		...mapActions('model', ['new_model','user_new_model']),
		/**
		 * construct the element tree
		 * @todo improve the rule of showing up elements
		 */
		mainprocess() {
			this.data = [];
			let modeltype = 'feature';
            var xmlobject = this.xml;
			// if it is feature model
			if(this.xml !== '')
			{
				/**
				 * get root element and insert to element tree data
				 * @function checkrootxml
				 * @function insertdata
				 */
				let rootxml = this.checkrootxml(xmlobject.mxGraphModel.root.root, modeltype);
				if(rootxml.t1 !== '' && rootxml.t2 !== '')
				{
					this.insertdata(rootxml.t1, rootxml.t2, 1, 'and', 'true', -1, -1);
					this.treecache.push(rootxml.t2);
					
					let checkall = true;
					let level = 1;
					// construct the element tree from lower level to higher level
					while(checkall)
					{
						checkall = false;
						// check all the relations
						let rel_lists = ['rel_abstract_root','rel_abstract_abstract','rel_concrete_root','rel_concrete_abstract'];
						for(let x = 0; x < rel_lists.length; x++)
						{
							if(xmlobject.mxGraphModel.root[rel_lists[x]] !== undefined)
							{
								if(Array.isArray(xmlobject.mxGraphModel.root[rel_lists[x]]))
								{
									for(let i = 0; i < xmlobject.mxGraphModel.root[rel_lists[x]].length; i++)
									{
										for(let j = 0; j < this.data.length; j++)
										{
											// if the target of the relation is in the element tree
											if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@parent'] === modeltype && 
											xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@target'] === this.data[j].data.nodeId && 
											this.data[j].data.level === level)
											{
												/**
												 * get the feature based on the source of the relation
												 * @function getfeature
												 */
												let newtemp = this.getfeature(xmlobject.mxGraphModel.root.abstract, xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@source'], modeltype);
												if(newtemp.t1 === '' && newtemp.t2 === '')
													newtemp = this.getfeature(xmlobject.mxGraphModel.root.concrete, xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@source'], modeltype);
												// insert this feature to the element tree and set its mandatory
												if(xmlobject.mxGraphModel.root[rel_lists[x]][i]['@relType'] === 'mandatory')	
												{
													this.insertdata(newtemp.t1, newtemp.t2, level + 1, this.getbundletype(xmlobject.mxGraphModel.root, newtemp.t2, modeltype), 'true', this.data[j].data.nodeId, j);
													this.treecache.push(newtemp.t2);
												}
												else if(xmlobject.mxGraphModel.root[rel_lists[x]][i]['@relType'] === 'optional')	
												{
													this.insertdata(newtemp.t1, newtemp.t2, level + 1, this.getbundletype(xmlobject.mxGraphModel.root, newtemp.t2, modeltype), 'false', this.data[j].data.nodeId, j);
													this.treecache.push(newtemp.t2);
												}
												checkall = true;
											}
										}
									}
								}
								else
								{
									for(let j = 0; j < this.data.length; j++)
									{
										// if the target of the relation is in the element tree
										if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@parent'] === modeltype && 
										xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@target'] === this.data[j].data.nodeId && 
										this.data[j].data.level === level)
										{
											/**
											 * get the feature based on the source of the relation
											 * @function getfeature
											 */
											let newtemp = this.getfeature(xmlobject.mxGraphModel.root.abstract, xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@source'], modeltype);
											if(newtemp.t1 === '' && newtemp.t2 === '')
												newtemp = this.getfeature(xmlobject.mxGraphModel.root.concrete, xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@source'], modeltype);
											// insert this feature to the element tree and set its mandatory
											if(xmlobject.mxGraphModel.root[rel_lists[x]]['@relType'] === 'mandatory')	
											{
												this.insertdata(newtemp.t1, newtemp.t2, level + 1, this.getbundletype(xmlobject.mxGraphModel.root, newtemp.t2, modeltype), 'true', this.data[j].data.nodeId, j);
												this.treecache.push(newtemp.t2);
											}
											else if(xmlobject.mxGraphModel.root[rel_lists[x]]['@relType'] === 'optional')
											{
												this.insertdata(newtemp.t1, newtemp.t2, level + 1, this.getbundletype(xmlobject.mxGraphModel.root, newtemp.t2, modeltype), 'false', this.data[j].data.nodeId, j);
												this.treecache.push(newtemp.t2);
											}
											checkall = true;
										}
									}
								}
							}
						}
						// check all the bundles
						let rel_bundle_lists = ['rel_bundle_abstract','rel_bundle_root'];
						for(let x = 0; x < rel_bundle_lists.length; x++)
						{
							if(xmlobject.mxGraphModel.root[rel_bundle_lists[x]] !== undefined)
							{
								if(Array.isArray(xmlobject.mxGraphModel.root[rel_bundle_lists[x]]))
								{
									for(let i = 0; i < xmlobject.mxGraphModel.root[rel_bundle_lists[x]].length; i++)
									{
										for(let j = 0; j < this.data.length; j++)
										{
											// if the target of the bundle is in the element tree
											if(xmlobject.mxGraphModel.root[rel_bundle_lists[x]][i].mxCell['@parent'] === modeltype && 
											xmlobject.mxGraphModel.root[rel_bundle_lists[x]][i].mxCell['@target'] === this.data[j].data.nodeId && 
											this.data[j].data.level === level)
											{
												/**
												 * @function insertbundle
												 */
												this.insertbundle(xmlobject.mxGraphModel.root, xmlobject.mxGraphModel.root[rel_bundle_lists[x]][i].mxCell['@source'], modeltype, this.data[j].data.nodeId, j, level);
												checkall = true;
											}
										}
									}
								}
								else
								{
									for(let j = 0; j < this.data.length; j++)
									{
										// if the target of the bundle is in the element tree
										if(xmlobject.mxGraphModel.root[rel_bundle_lists[x]].mxCell['@parent'] === modeltype && 
										xmlobject.mxGraphModel.root[rel_bundle_lists[x]].mxCell['@target'] === this.data[j].data.nodeId && 
										this.data[j].data.level === level)
										{
											/**
											 * @function insertbundle
											 */
											this.insertbundle(xmlobject.mxGraphModel.root, xmlobject.mxGraphModel.root[rel_bundle_lists[x]].mxCell['@source'], modeltype, this.data[j].data.nodeId, j, level);
											checkall = true;
										}
									}
								}
							}
						}
						level += 1;
					}
				}
				// else	
				// 	this.$Notice.info({
                //     	title: 'Xml to Tree',
                //     	desc: 'Please put the root feature first!'
				// 	});
				
			}
			// else
			// 	this.$Notice.info({
            //         title: 'Xml to Tree',
            //         desc: 'The tree is constructed based on feature model!'
			//     });
			if(this.xml !== '')
			{
				/**
				 * check all the elements which are not in the cache and insert them in the level 1 in the element tree data
				 * @function insertdata
				 */
				let list = ['root', 'abstract', 'concrete', 'component', 'file'];
				for(let i = 0; i < list.length; i++)
				{
					if(Array.isArray(xmlobject.mxGraphModel.root[list[i]]) && xmlobject.mxGraphModel.root[list[i]] !== undefined)
					{
						for(let j = 0; j < xmlobject.mxGraphModel.root[list[i]].length; j++)
						{
							if(xmlobject.mxGraphModel.root[list[i]][j].mxCell['@parent'] === modeltype && !this.treecache.includes(xmlobject.mxGraphModel.root[list[i]][j]['@id']))
								this.insertdata(xmlobject.mxGraphModel.root[list[i]][j]['@label'], xmlobject.mxGraphModel.root[list[i]][j]['@id'], 1, 'and', 'true', -1, -1);
						}
					}
					else if(xmlobject.mxGraphModel.root[list[i]] !== undefined)
					{
						if(xmlobject.mxGraphModel.root[list[i]].mxCell['@parent'] === modeltype && !this.treecache.includes(xmlobject.mxGraphModel.root[list[i]]['@id']))
							this.insertdata(xmlobject.mxGraphModel.root[list[i]]['@label'], xmlobject.mxGraphModel.root[list[i]]['@id'], 1, 'and', 'true', -1, -1);
					}
				}
			}
			const { modelname, xml, data, id } = this;
            if (modelname && xml && data) {
            	this.new_model({modelname, xml, data, id});
        	}
		},
		/**
		 * insert the output of bundle in the element tree
		 * @param {object} root 		- xml object
		 * @param {number} relbundleid	- the id of bundle
		 * @param {string} modeltype	- the type of the diagram
		 * @param {number} parentid		- the parent id in the element tree
		 * @param {number} parentindex	- the index of parent in the element tree
		 * @param {number} level		- the current level
		 */
		insertbundle(root, relbundleid, modeltype, parentid, parentindex, level) {
			// check all the relations
			let rel_concrete_lists = ['rel_abstract_bundle','rel_concrete_bundle'];
			for(let x = 0; x < rel_concrete_lists.length; x++)
			{
				if(relbundleid !== -1 && root[rel_concrete_lists[x]] !== undefined)
				{
					if(Array.isArray(root[rel_concrete_lists[x]]))
					{
						for(let i = 0; i < root[rel_concrete_lists[x]].length; i++)
						{
							// if the target of relation is the id of bundle
							if(root[rel_concrete_lists[x]][i].mxCell['@parent'] === modeltype && 
							root[rel_concrete_lists[x]][i].mxCell['@target'] === relbundleid)
							{
								/**
								 * get the feature based on the source of the relation
								 * @function getfeature
								 */
								let newtemp = this.getfeature(root.abstract, root[rel_concrete_lists[x]][i].mxCell['@source'], modeltype);
								if(newtemp.t1 === '' && newtemp.t2 === '')
									newtemp = this.getfeature(root.concrete, root[rel_concrete_lists[x]][i].mxCell['@source'], modeltype);
								// insert this feature to the element tree
								this.insertdata(newtemp.t1, newtemp.t2, level + 1, this.getbundletype(root, newtemp.t2, modeltype), 'true', parentid, parentindex);
								this.treecache.push(newtemp.t2);
							}		
						}
					}
					// if the target of relation is the id of bundle
					else if(root[rel_concrete_lists[x]].mxCell['@parent'] === modeltype && 
					root[rel_concrete_lists[x]].mxCell['@target'] === relbundleid)
					{
						/**
						 * get the feature based on the source of the relation
						 * @function getfeature
						 */
						let newtemp = this.getfeature(root.abstract, root[rel_concrete_lists[x]].mxCell['@source'], modeltype);
						if(newtemp.t1 === '' && newtemp.t2 === '')
							newtemp = this.getfeature(root.concrete, root[rel_concrete_lists[x]].mxCell['@source'], modeltype);
						// insert this feature to the element tree
						this.insertdata(newtemp.t1, newtemp.t2, level + 1, this.getbundletype(root, newtemp.t2, modeltype), 'true', parentid, parentindex);
						this.treecache.push(newtemp.t2);
					}
				}
			}
		},
		/**
		 * set the type of the current element to 'feature' or 'or' or 'alt' or 'and' in the element tree
		 * @param {object} root 		- the xml object
		 * @param {number} id 			- the id of the current element
		 * @param {string} modeltype	- the type of the diagram
		 */
		getbundletype(root, id, modeltype) {
			// set default type to feature'
			let temp = 'feature';
			// get the source of the relation between bundle and abstract feature
			let bundleid = -1;
			if(root.rel_bundle_abstract !== undefined)
			{
				if(Array.isArray(root.rel_bundle_abstract))
				{
					for(let i = 0; i < root.rel_bundle_abstract.length; i++)
					{
						if(root.rel_bundle_abstract[i].mxCell['@parent'] === modeltype && root.rel_bundle_abstract[i].mxCell['@target'] === id)
							bundleid = root.rel_bundle_abstract[i].mxCell['@source'];
					}
				}
				else if(root.rel_bundle_abstract.mxCell['@parent'] === modeltype && root.rel_bundle_abstract.mxCell['@target'] === id)
					bundleid = root.rel_bundle_abstract.mxCell['@source'];
			}
			// check the type of the bundle either 'or' or 'alt'
			if(root.bundle !== undefined)
			{
				if(Array.isArray(root.bundle))
				{
					for(let i = 0; i < root.bundle.length; i++)
					{
						if(root.bundle[i].mxCell['@parent'] === modeltype && root.bundle[i]['@id'] === bundleid)
						{
							if(root.bundle[i]['@bundleType'] === 'OR')
								temp = 'or';
							else if(root.bundle[i]['@bundleType'] === 'XOR')
								temp = 'alt';
						}
					}
				}
				else if(root.bundle.mxCell['@parent'] === modeltype && root.bundle['@id'] === bundleid)
				{
					if(root.bundle['@bundleType'] === 'OR')
						temp = 'or';
					else if(root.bundle['@bundleType'] === 'XOR')
						temp = 'alt';
				}
			}
			// if there is no bundle, set the type to 'and'
			let rel_lists = ['rel_abstract_root','rel_abstract_abstract','rel_concrete_root','rel_concrete_abstract'];
			for(let x = 0; x < rel_lists.length; x++)
			{
				if(root[rel_lists[x]] !== undefined)
			{
				if(Array.isArray(root[rel_lists[x]]))
				{
					for(let i = 0; i < root[rel_lists[x]].length; i++)
					{
						if(root[rel_lists[x]][i].mxCell['@parent'] === modeltype && root[rel_lists[x]][i].mxCell['@target'] === id 
						&& root[rel_lists[x]][i]['@relType'] !== 'requires' && root[rel_lists[x]][i]['@relType'] !== 'excludes')
							temp = 'and';
					}
				}
				else if(root[rel_lists[x]].mxCell['@parent'] === modeltype && root[rel_lists[x]].mxCell['@target'] === id
				&& root[rel_lists[x]]['@relType'] !== 'requires' && root[rel_lists[x]]['@relType'] !== 'excludes')
					temp = 'and';
			}
			}
			return temp;
		},
		/**
		 * get the feature anme based on id
		 * @param {string} feature		- the xml object
		 * @param {number} id 			- the id of the current element
		 * @param {string} modeltype	- the type of the diagram
		 */
		getfeature(feature, id, modeltype) {
			let temp = {t1:'',t2:''};
			if(feature !== undefined)
			{
				if(Array.isArray(feature))
				{
					for(let i = 0; i < feature.length; i++)
					{
						if(feature[i].mxCell['@parent'] === modeltype && feature[i]['@id'] === id)
						{
							temp.t1 = feature[i]['@label'];
							temp.t2 = id;
						}
					}
				}
				else if(feature.mxCell['@parent'] === modeltype && feature['@id'] === id)
				{
					temp.t1 = feature['@label'];
					temp.t2 = id;
				}
			}
			return temp;
		},
		/**
		 * get the name and the id of root
		 * @param {string} root 		- the xml object
		 * @param {string} modeltype	- the type of the diagram
		 */
		checkrootxml(root, modeltype) {
			let temp = {t1:'',t2:''};
			if(root !== undefined)
			{
				if(Array.isArray(root))
				{
					for(let i = 0; i < root.length; i++)
					{
						if(root[i].mxCell['@parent'] === modeltype)
						{
							temp.t1 = root[i]['@label'];
							temp.t2 = root[i]['@id'];
						}
					}
				}
				else if(root.mxCell['@parent'] === modeltype)
				{
					temp.t1 = root['@label'];
					temp.t2 = root['@id'];
				}
			}
			return temp;
		},
		/**
		 * insert the element into the element tree data
		 * @param {string} name the name of the element
		 * @param {number} newid the id of the element
		 * @param {number} level the level of the element
		 * @param {string} type the type of the element
		 * @param {string} mandatory the mandatory of the element
		 * @param {boolean} tick the selection and the disselection of features
		 * @param {boolean} default_tick the undecided default features
		 * @param {number} parentid the parent id in the element tree
		 * @param {number} parentindex the index of parent in the element tree
 		 */
		insertdata(name, newid, level, type, mandatory, parentid, parentindex) {
            this.data.splice(parentindex + 1, 0 ,{
				data: {
					open: true,
					isSelected: false,
					level: level,
					nodeId: newid,
				    nodeName: name,
              		type: type,
					tick: false,
					default_tick: false,
              		mandatory: mandatory,
					parentId: parentid
				},
				numberOfChildren: 0
			});
            if(parentindex !== -1)
				this.data[parentindex].numberOfChildren++;
		},
		/**
		 * the rule to show up the element of the element tree
		 * @param {number} index the index of the current element
		 */
		checkchildnode(index) {
			for(let i = 1; i < index+1; i++)
			{
				// if the element is closed, his children is not displayed
				if(this.data[index-i].data.level < this.data[index].data.level)
				{
					if(this.data[index-i].data.open === false)
					{
						this.data[index].data.open = false;
						return false;
					}
					else 
						break;
				}
			}
			return true;
		},
		/**
		 * set open and close to the element
		 * @param {number} index the index of the current element
		 */
		expand_menu(index) {
			var _this = this;
			_this.data[index].data.open = !_this.data[index].data.open;	
		},
		/**
		 * click function
		 * @param {number} index the index of the current element
		 */
		clickme(index){
			var _this = this;
			_this.data.forEach((item)=>{
				item.data.isSelected = false;
			});
			//_this.data[index].data.isSelected = true;
		},
		/**
		 * double click function
		 * @param {number} index the index of the current element
		 */
		dblClick(index){
			this.expand_menu(index);
		},
		/**
		 * function of checkbox
		 * @param {number} index the index of the current element
		 */
		itemclick(index){
			let counter = 0;
			this.checkclick(index);
			this.checkconstraints(index);
		},
		saveclosetree(){
			let selected_list = [];
			let selected_list_name = [];
			let disselected_list = [];
			let disselected_list_name = [];
			for(let i = 0; i < this.data.length; i++)
			{
				if(this.data[i].data.tick)
				{
					selected_list.push(this.data[i].data.nodeId);
					selected_list_name.push(this.data[i].data.nodeName);
				}
				if(this.data[i].data.default_tick && !this.data[i].data.tick)
				{
					disselected_list.push(this.data[i].data.nodeId);
					disselected_list_name.push(this.data[i].data.nodeName);
				}
			}
			let id = this.account.user.id;
			let name = this.modelname;
			let thisdata = this.data;
			this.addselections({id ,selected_list, selected_list_name, disselected_list, disselected_list_name, name});
			this.xml = '';
			this.data = [];
			let input = document.getElementById('fileInput');
			input.type = 'text';
    		input.type = 'file';
		},
		closetree(){
			this.xml = '';
			this.data = [];
			let input = document.getElementById('fileInput');
			input.type = 'text';
    		input.type = 'file';
		},
		/**
		 * the rule of selections for checkbox
		 * @param {number} index the index of the current element
		 */
		checkclick(index){
			// check children
			this.checkchildren(index);
			// if type is 'alt', only one children is selected
			for(let i = 0; i < this.data.length; i++)
			{
				if(this.data[i].data.nodeId === this.data[index].data.parentId)
				{
					if(this.data[i].data.type === 'alt' && this.data[index].data.tick === true)
					{
						for(let j = 0; j < this.data.length; j++)
						{
							if(this.data[j].data.parentId === this.data[index].data.parentId && j !== index)
							{
								this.data[j].data.tick = false;
								this.data[j].data.default_tick = true;
							}
						}
					}
					// if(this.data[i].data.type === 'and')
					// {
					// 	for(let j = 0; j < this.data.length; j++)
					// 	{
					// 		if(this.data[j].data.parentId === this.data[index].data.parentId && this.data[j].data.mandatory === 'true')
					// 			this.data[j].data.tick = this.data[index].data.tick;
					// 	}
					// }
				}
			}
			// check parents
			if(this.data[index].data.tick === true)
			{
				// if the element is selected, all his parents need to be selected
				let temp_parentid = this.data[index].data.parentId;
				while(temp_parentid !== -1)
				{
					for(let i = 0; i < index; i++)
					{
						if(this.data[i].data.nodeId === temp_parentid)
						{
							this.data[i].data.tick = true;
							this.data[i].data.default_tick = true;
							this.checkchildren(i);
							temp_parentid = this.data[i].data.parentId;
						}
					}
				}
			}
			else
			{
				// if the element is not selected
				let temp_parentid = this.data[index].data.parentId;
				while(temp_parentid !== -1)
				{
					// if the other element in the same level is selected, disregrad
					let temp_selected = false;
					for(let i = 0; i < this.data.length; i++)
					{
						if(this.data[i].data.parentId === temp_parentid && this.data[i].data.tick)
							temp_selected = true;
					}
					if(temp_selected)
						break;
					// if the current one is the last one selected in this level, disselect the parent 
					else
					{
						for(let i = 0; i < this.data.length; i++)
						{
							if(this.data[i].data.nodeId === temp_parentid)
							{
								this.data[i].data.tick = false;
								this.data[i].data.default_tick = true;
								temp_parentid = this.data[i].data.parentId;
							}
						}
					}
				}
			}
		},
		/**
		 * the rule of selecting children for checkbox
		 * @param {number} index the index of the current element
		 */
		checkchildren(index){
			for(let i = index + 1; i < this.data.length; i++) 
			{
				if(this.data[index].data.level > this.data[i].data.level || this.data[index].data.level === this.data[i].data.level)
					break;
				// if it is not selected, the children should be not selected
				if(this.data[index].data.tick === false)
				{
					this.data[i].data.tick = false;
					this.data[i].data.default_tick = true;
					continue;
				}
				// if it is selected, select all the following mandatory children
				else
				{
					for(let j = 0; j < this.data.length; j++)
					{
						if(this.data[j].data.nodeId === this.data[i].data.parentId && this.data[j].data.tick && this.checkmandatorycircle(i))
						{
							this.data[i].data.tick = true;
							this.data[i].data.default_tick = true;
						}
					}
				}
			}
		},
		/**
		 * if the type is 'and' and mandatory is true, show the black circle
		 * @param {number} index the index of the current element
		 */
		checkmandatorycircle(index) {
			for(let i = 0; i < this.data.length; i++)
			{
				if(this.data[i].data.nodeId === this.data[index].data.parentId && this.data[i].data.type === 'and' && this.data[index].data.mandatory === 'true')
					return true;
			}
			return false;
		},
		/**
		 * the rule of constraints for checkbox
		 * @param {number} index the index of the current element
		 */
		checkconstraints(index){
			let checkindex = -1;
			let modeltype = 'feature';
			var xmlobject = this.xml;
			// check all the relations
			let rel_lists = ['rel_abstract_root','rel_abstract_abstract','rel_concrete_root','rel_concrete_abstract','rel_concrete_concrete'];
			for(let x = 0; x < rel_lists.length; x++)
			{
				if(xmlobject.mxGraphModel.root[rel_lists[x]] !== undefined)
				{
					if(Array.isArray(xmlobject.mxGraphModel.root[rel_lists[x]]))
					{
						for(let i = 0; i < xmlobject.mxGraphModel.root[rel_lists[x]].length; i++)
						{
							for(let j = 0; j < this.data.length; j++)
							{
								// if the source is in constraint relation
								if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@parent'] === modeltype && 
								xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@source'] === this.data[index].data.nodeId)
								{
									// if the constraints is 'requires', set the target true
									if(xmlobject.mxGraphModel.root[rel_lists[x]][i]['@relType'] === 'requires')
									{
										for(let k = 0; k < this.data.length; k++)
										{
											// requires conforms to both select and disselect
											if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@target'] === this.data[k].data.nodeId  && this.data[index].data.tick)
											{
												this.data[k].data.tick = this.data[index].data.tick;
												this.data[k].data.default_tick = true;
												this.checkclick(k);
												checkindex = k;
											}
										}
									}	
									// if the constraints is 'excludes', set the opposite of the source to the target
									else if(xmlobject.mxGraphModel.root[rel_lists[x]][i]['@relType'] === 'excludes')	
									{
										for(let k = 0; k < this.data.length; k++)
										{
											//excludes conforms to only select
											if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@target'] === this.data[k].data.nodeId && this.data[index].data.tick)
											{	
												this.data[k].data.tick = !this.data[index].data.tick;
												this.data[k].data.default_tick = true;
												this.checkclick(k);
												checkindex = k;
											}
										}
									}
								}
								else if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@parent'] === modeltype && 
								xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@target'] === this.data[index].data.nodeId)
								{
									// if the constraints is 'requires', set the source false
									if(xmlobject.mxGraphModel.root[rel_lists[x]][i]['@relType'] === 'requires')
									{
										for(let k = 0; k < this.data.length; k++)
										{
											// requires conforms to both select and disselect
											if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@source'] === this.data[k].data.nodeId  && !this.data[index].data.tick)
											{
												this.data[k].data.tick = this.data[index].data.tick;
												this.data[k].data.default_tick = true;
												this.checkclick(k);
												checkindex = k;
											}
										}
									}
									// if the target is in constraint relation and the constraints is 'excludes', 
									// set the opposite of the target to the source	
									else if(xmlobject.mxGraphModel.root[rel_lists[x]][i]['@relType'] === 'excludes')
									{
										for(let k = 0; k < this.data.length; k++)
										{
											//excludes conforms to only select
											if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@source'] === this.data[k].data.nodeId && this.data[index].data.tick)
											{
												this.data[k].data.tick = !this.data[index].data.tick;
												this.data[k].data.default_tick = true;
												this.checkclick(k);
												checkindex = k;
											}	
										}
									}
									// else if(xmlobject.mxGraphModel.root[rel_lists[x]][i]['@relType'] === 'requires')
									// {
									// 	for(let k = 0; k < this.data.length; k++)
									// 	{
									// 		//requires conforms to only disselect
									// 		if(xmlobject.mxGraphModel.root[rel_lists[x]][i].mxCell['@source'] === this.data[k].data.nodeId && !this.data[index].data.tick)
									// 		{
									// 			this.data[k].data.tick = this.data[index].data.tick;
									// 			this.data[k].data.default_tick = true;
									// 			this.checkclick(k);
									// 			checkindex = k;
									// 		}	
									// 	}
									// }
								}
							}
						}
					}
					else
					{
						for(let j = 0; j < this.data.length; j++)
						{
							// if the source is in constraint relation
							if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@parent'] === modeltype && 
							xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@source'] === this.data[index].data.nodeId)
							{
								// if the constraints is 'requires', set the target true
								if(xmlobject.mxGraphModel.root[rel_lists[x]]['@relType'] === 'requires')
								{
									for(let k = 0; k < this.data.length; k++)
									{
										// requires conforms to both select and disselect
										if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@target'] === this.data[k].data.nodeId && this.data[index].data.tick)
										{
											this.data[k].data.tick = this.data[index].data.tick;
											this.data[k].data.default_tick = true;
											this.checkclick(k);
											checkindex = k;
										}	
									}
								}	
								// if the constraints is 'excludes', set the opposite of the source to the target
								else if(xmlobject.mxGraphModel.root[rel_lists[x]]['@relType'] === 'excludes')	
								{
									for(let k = 0; k < this.data.length; k++)
									{
										//excludes conforms to only select
										if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@target'] === this.data[k].data.nodeId && this.data[index].data.tick)
										{
											this.data[k].data.tick = !this.data[index].data.tick;
											this.data[k].data.default_tick = true;
											this.checkclick(k);
											checkindex = k;
										}	
									}
								}
							}
							else if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@parent'] === modeltype && 
							xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@target'] === this.data[index].data.nodeId)
							{
								// if the constraints is 'requires', set the source false
								if(xmlobject.mxGraphModel.root[rel_lists[x]]['@relType'] === 'requires')
								{
									for(let k = 0; k < this.data.length; k++)
									{
										// requires conforms to both select and disselect
										if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@source'] === this.data[k].data.nodeId && !this.data[index].data.tick)
										{
											this.data[k].data.tick = this.data[index].data.tick;
											this.data[k].data.default_tick = true;
											this.checkclick(k);
											checkindex = k;
										}	
									}
								}	
								// if the target is in constraint relation and the constraints is 'excludes', 
								// set the opposite of the target to the source
								else if(xmlobject.mxGraphModel.root[rel_lists[x]]['@relType'] === 'excludes')
								{
									for(let k = 0; k < this.data.length; k++)
									{
										//excludes conforms to only select
										if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@source'] === this.data[k].data.nodeId && this.data[index].data.tick)
										{
											this.data[k].data.tick = !this.data[index].data.tick;
											this.data[k].data.default_tick = true;
											this.checkclick(k);
											checkindex = k;
										}	
									}
								}
								// else if(xmlobject.mxGraphModel.root[rel_lists[x]]['@relType'] === 'requires')
								// {
								// 	for(let k = 0; k < this.data.length; k++)
								// 	{
								// 		//requires conforms to only disselect
								// 		if(xmlobject.mxGraphModel.root[rel_lists[x]].mxCell['@source'] === this.data[k].data.nodeId && !this.data[index].data.tick)
								// 		{
								// 			this.data[k].data.tick = this.data[index].data.tick;
								// 			this.data[k].data.default_tick = true;
								// 			this.checkclick(k);
								// 			checkindex = k;
								// 		}	
								// 	}
								// }
							}
						}
					}
				}
			}
			if(checkindex !== -1)
			{
				if(this.checkadditionalconstraint(xmlobject.mxGraphModel.root,index,checkindex,modeltype))
					this.checkconstraints(checkindex);
			}
		},
		/**
		 * check the checked constraint element if it has additional constraints
		 * @param {object} root 		- the xml object
		 * @param {number} index		- the original index of the constraint element
		 * @param {number} c_index		- the index of the checked constraint element
		 * @param {string} modeltype	- the type of the diagram
		 */
		checkadditionalconstraint(root, index, c_index, modeltype)
		{
			let rel_lists = ['rel_abstract_root','rel_abstract_abstract','rel_concrete_root','rel_concrete_abstract','rel_concrete_concrete'];
			for(let x = 0; x < rel_lists.length; x++)
			{
				if(root[rel_lists[x]] !== undefined)
				{
					if(Array.isArray(root[rel_lists[x]]))
					{
						for(let i = 0; i < root[rel_lists[x]].length; i++)
						{
							for(let j = 0; j < this.data.length; j++)
							{
								// if the source is in constraint relation
								if(root[rel_lists[x]][i].mxCell['@parent'] === modeltype && 
								root[rel_lists[x]][i].mxCell['@source'] === this.data[c_index].data.nodeId)
								{
									// if the constraints is 'requires', set the target true
									if(root[rel_lists[x]][i]['@relType'] === 'requires')
									{
										for(let k = 0; k < this.data.length; k++)
										{
											// requires conforms to both select and disselect
											if(root[rel_lists[x]][i].mxCell['@target'] === this.data[k].data.nodeId && k !== index && this.data[c_index].data.tick)
												return true;
										}
									}	
									// if the constraints is 'excludes', set the opposite of the source to the target
									else if(root[rel_lists[x]][i]['@relType'] === 'excludes')	
									{
										for(let k = 0; k < this.data.length; k++)
										{
											//excludes conforms to only select
											if(root[rel_lists[x]][i].mxCell['@target'] === this.data[k].data.nodeId && this.data[c_index].data.tick && k !== index)
												return true;
										}
									}
								}
								// if the target is in constraint relation and the constraints is 'excludes', 
								// set the opposite of the target to the source
								else if(root[rel_lists[x]][i].mxCell['@parent'] === modeltype && 
								root[rel_lists[x]][i].mxCell['@target'] === this.data[c_index].data.nodeId)
								{
									if(root[rel_lists[x]][i]['@relType'] === 'excludes')
									{
										for(let k = 0; k < this.data.length; k++)
										{
											//excludes conforms to only select
											if(root[rel_lists[x]][i].mxCell['@source'] === this.data[k].data.nodeId && this.data[c_index].data.tick && k !== index)
												return true;
										}
									}
									else if(root[rel_lists[x]][i]['@relType'] === 'requires')
									{
										for(let k = 0; k < this.data.length; k++)
										{
											//requires conforms to only disselect
											if(root[rel_lists[x]][i].mxCell['@source'] === this.data[k].data.nodeId && !this.data[c_index].data.tick && k !== index)
												return true;
										}
									}
								}
							}
						}
					}
					else
					{
						for(let j = 0; j < this.data.length; j++)
						{
							// if the source is in constraint relation
							if(root[rel_lists[x]].mxCell['@parent'] === modeltype && 
							root[rel_lists[x]].mxCell['@source'] === this.data[c_index].data.nodeId)
							{
								// if the constraints is 'requires', set the target true
								if(root[rel_lists[x]]['@relType'] === 'requires')
								{
									for(let k = 0; k < this.data.length; k++)
									{
										// requires conforms to both select and disselect
										if(root[rel_lists[x]].mxCell['@target'] === this.data[k].data.nodeId && k !== index && this.data[c_index].data.tick)
											return true;
									}
								}	
								// if the constraints is 'excludes', set the opposite of the source to the target
								else if(root[rel_lists[x]]['@relType'] === 'excludes')	
								{
									for(let k = 0; k < this.data.length; k++)
									{
										//excludes conforms to only select
										if(root[rel_lists[x]].mxCell['@target'] === this.data[k].data.nodeId && this.data[c_index].data.tick && k !== index)
											return true;
									}
								}
							}
							// if the target is in constraint relation and the constraints is 'excludes', 
							// set the opposite of the target to the source
							else if(root[rel_lists[x]].mxCell['@parent'] === modeltype && 
							root[rel_lists[x]].mxCell['@target'] === this.data[c_index].data.nodeId)
							{
								if(root[rel_lists[x]]['@relType'] === 'excludes')
								{
									for(let k = 0; k < this.data.length; k++)
									{
										//excludes conforms to only select
										if(root[rel_lists[x]].mxCell['@source'] === this.data[k].data.nodeId && this.data[c_index].data.tick && k !== index)
											return true;
									}
								}
								else if(root[rel_lists[x]]['@relType'] === 'requires')
								{
									for(let k = 0; k < this.data.length; k++)
									{
										//requires conforms to only disselect
										if(root[rel_lists[x]].mxCell['@source'] === this.data[k].data.nodeId && !this.data[c_index].data.tick && k !== index)
											return true;
									}
								}
							}
						}
					}
				}
			}
			return false;
		},
		processFile(event) {
			this.initlevel = 0;
			var xmlDoc = '';
			var file = event.target.files[0];
			var reader = new FileReader();
			let name = event.target.files[0].name;
			reader.onload = function(event) {
				//console.log(event.target.result);
				xmlDoc = (new DOMParser()).parseFromString(event.target.result,"text/xml");
				var xmlobject = JSON.parse(xml2json(xmlDoc,''));
				Bus.$emit('getxml',{name,xmlobject});
			};
			reader.readAsText(file);
    	}
	}
}
</script>
<style scoped>
	.naza-tree-warp {
		width: 100%;
		height: 100%;
		min-width: 175px;
		border-bottom: 0 none;
		border-top: 0 none;
		border-right: 0 none;
	}
	.naza-tree-warp .naza-tree-inner {
		/* max-height: 500px; */
		height: 100%;
		width: 100%;
		box-shadow: none;
		overflow: auto;
		padding: 5px 0px;
		padding-bottom: 30px;
	}
	.naza-tree-warp .naza-tree-inner .naza-tree {
		padding: 0;
		margin: 0;
		cursor: pointer;
		display: inline-block;
		min-width: 100%;
	}
	.naza-tree-warp .naza-tree-inner .naza-tree .selected {
		background-color: #5bc0de;
	}
	.naza-tree-warp .naza-tree-inner .naza-tree .naza-tree-row {
		list-style: none;
		min-width: 250px;
		line-height: 30px;
		height: 30px;
		float: none;
		color: #555;
	}
	.naza-tree-warp .naza-tree-inner .naza-tree .naza-tree-row:hover {
		background-color: #e5e5e5;
	}
	.naza-tree-warp .naza-tree-inner .naza-tree .naza-tree-row a {
		display: block;
		position: relative;
		line-height: 30px;
		height: 30px;
		padding: 0px 10px;
		text-decoration: none;
		text-align: left;
		color: #555;
		font-size: 12px;
	}
	.naza-tree-warp .naza-tree-inner .naza-tree .naza-tree-row a .name-container {
		display: inline-block;
		width: 100%;
		white-space: nowrap;
		vertical-align: middle;
	}
	.naza-tree-warp .naza-tree-inner .naza-tree .naza-tree-row a i {
		display: inline-block;
		font-size: 14px;
		margin-bottom: 2px;
	}
	.show-wrap::-webkit-scrollbar {
		width: 10px;
		height: 10px;
		background-color: rgb(120, 120, 120);
		border-radius: 5px;
	}
	.show-wrap::-webkit-scrollbar-track{
		width: 10px;
		height: 10px;
		background-color: #ddd;
		border-radius: 5px;
	}
	.show-wrap::-webkit-scrollbar-thumb{
		width: 10px;
		height: 10px;
		background-color: rgb(120, 120, 120);
		border-radius: 5px;
	}
    .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
    .demo-spin-col{
        height: 100px;
        position: relative;
        border: 1px solid #eee;
    }
	img {
  	width: 15px;
	}
</style>


