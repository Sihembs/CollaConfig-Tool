# Presentation
  Colla-Config tool is a Node.js open source project implementing a new collaborative product line configuration approach (Colla-Config), that relies on free order configuration process. Each stakeholder freely expresses his/her configuration decisions towards the desired product without being constrained by the configuration decisions made by the other ones. The conflict resolution strategy is preference-based. It is based on (1) stakeholders' preferences elicitation under the form of substitution rules to be considered if one or more of their configuration decisions could not be retained in case of conflict, and (2) computation of Minimal Correction Subsets allowing to resolve all conflicts while fairely taking into account all stakeholders preferences.
  For more information please refer to the research papers about Colla-Config.
  
# Installation and set-up
1. Install Node.js from: https://nodejs.org/en/download/
2. From the terminal (command prompt), type the following command line: "npm install -g @vue/cli"
3. Download and unzip the project available by clicking on the following link: https://github.com/Sihembs/CollaConfig-Tool 
4. Go to the folder where you unzipped the project by using the "cd" command on the terminal.
5. Type the command "npm install" to install all the dependecies of the project
6. Type "npm start" to execute the project.

# How-to-use 
## as a user (stakeholder)
1. Register. You may specify your preferences by selecting one or more substitution rules. 
2. Login (you may modify your personal information and selected substitution rules)
3. Upload a feature model of a product line as XML file
4. Configure the model by selecting desired and/or undesired features
5. Save and close

## as a product manager
1. Login with admin/admin credentials
2. Choose "Merge" option behind the feature model XML file name
3. Select the prioritized stakeholder, and optionnaly "Send the final configuration to all the stakeholders"
4. Choose "Start resolution"

# System requirements
Please check the Node.js website for more information about system requirements.
