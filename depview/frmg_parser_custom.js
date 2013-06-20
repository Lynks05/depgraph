function generateTooltipContent(word){
  var me = DepGraph.getInstance(word);
  var d = word.__data__;
  
  var title = me.viewer.createElement("h1",d['#id']);
  var infos = new Array();
  for(data in d['#data']){
    var div = me.viewer.createDiv(data);
    div.append();
    d['#data'][data];
  }
  
}

function showRefs(){
  var me = DepGraph.getInstance(this);
  var coords = this.getBoundingClientRect();
  var point = {x:coords.left,y:coords.top + coords.height + 2};
  var div ='<div>Reference Infos : <br>';
  div += 'Sentence : ' + fix_missing_a_closing_tag(me.sentenceLink) + '<br>'
  + 'Back Links : ' + me.refs
  +'</div>';
  div = jQuery(div);
  me.viewer.loadTooltipContent(div);
  me.viewer.lockTooltip();
  me.viewer.tooltipExitButton.show();
  me.viewer.showTooltip(point);

}

function fix_missing_a_closing_tag(link){
  if(link.indexOf('</a>', link.length - 4) !== -1){
    return link;
  }else{
    return link + '</a>';
  }
}

function save_default(depgraph){
  depgraph.cleanData();
  jQuery.ajax({
    type: 'POST', 
    url: 'edit/save',
    data: {
      format:depgraph.dataFormat,
      options: '',
      data:depgraph.data,
    },
    dataType : 'json',
    success: function(data, textStatus, jqXHR) {
      depgraph.editObject.lastSavedPtr = depgraph.editObject.currentPtr;
      depgraph.editObject.updateSaveState();
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(textStatus);
    }
  });
}

function FRMGEditMode(urlFRMGServer){
  this.mode = {
      name : 'frmg',
      onWordSelect : showAltOnNodeClick,
      onLinkSelect : selectAlternative,
      onChunkSelect : selectObject,
      onWordContext : {
        'Show Infos': function(depgraph,element) {  // element is the jquery obj clicked on when context menu launched
          showToolTip(depgraph,element);
        },
        'HighLight' : function(depgraph,element) {  // element is the jquery obj clicked on when context menu launched
          processhighlightmode(depgraph,element);
        }
      },
      onLinkContext : {
        'Show Infos': function(depgraph,element) {  // element is the jquery obj clicked on when context menu launched
          showToolTip(depgraph,element);
        },
        'HighLight' : function(depgraph,element) {  // element is the jquery obj clicked on when context menu launched
          processhighlightmode(depgraph,element);
        }
      },
      onChunkContext : null,
      keyHandler : editKeyDownFRMG,
      undo : frmgUndo,
      save:frmg_save,
      highlightInfos:null,
    };
  
  function frmg_save(depgraph){
    var params = getPreviousParams(depgraph);
    var highlightInfos = depgraph.editObject.mode[depgraph.editObject.editMode].highlightInfos;
    jQuery.ajax({
      type: 'POST', 
      url: 'edit/save',
      data: {
        format:'frmgserver',
        options: params,
        highlighting:highlightInfos,
        data:depgraph.sentence,
      },
      dataType : 'json',
      success: function(data, textStatus, jqXHR) {
        depgraph.editObject.lastSavedPtr = depgraph.editObject.currentPtr;
        depgraph.editObject.updateSaveState();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(textStatus);
      }
    });
  }
  
  function showAltOnNodeClick(depgraph,params){
    if(depgraph.editObject.previousSelectedObject != null && !isALink(depgraph.editObject.previousSelectedObject)){
      hideAltLinks(depgraph,depgraph.editObject.previousSelectedObject);
    }
    
    if(processhighlightmode(depgraph,this)){
      return;
    }
    
    if(this == depgraph.editObject.previousSelectedObject){
      depgraph.editObject.clearSelection();
      return;
    }
    depgraph.editObject.selectObject(this);
    showAltLinks(depgraph,this);
  }

  function frmgUndo(depgraph,rollbackdata){
    if(rollbackdata.baseAction == 'removeEdge' || rollbackdata.baseAction == 'selectAlternative'){
      var param = rollbackdata.previousParams;
      if(param == ''){
        param = depgraph.original_data.graph.params;
      }
      getNewData(depgraph,depgraph.sentence,param);
    }
  }

  function editKeyDownFRMG (depgraph,params){
    if(params.keyCode == 46){
      if(depgraph.editObject.previousSelectedObject!= null){
        if(isALink(depgraph.editObject.previousSelectedObject)){
          var params = removeLinkForNewData(depgraph,depgraph.sentence,depgraph.editObject.previousSelectedObject.__data__);
          return {baseAction:'removeEdge',previousParams:getPreviousParams(depgraph),currentParams:params};
        }
      }
    }
  }

  function selectAlternative(depgraph,params){
    if(depgraph.editObject.previousSelectedObject != null && !isALink(depgraph.editObject.previousSelectedObject)){
      hideAltLinks(depgraph,depgraph.editObject.previousSelectedObject);
    }
    
    if(processhighlightmode(depgraph,this)){
      return;
    }
    
    if(isALink(this) && true == this.__data__['#data'].virtual){
      var params = "";
      for(id  in this.__data__['ref_ids']){
        params += "eid=" + this.__data__['ref_ids'][id] + "&+8000";
        getNewData(depgraph,depgraph.sentence,params);
        return {baseAction:'selectAlternative',previousParams:getPreviousParams(depgraph),currentParams:params};
      }
    }
  }

  function getPreviousParams(depgraph){
    var eo = depgraph.editObject;
    if(eo.currentPtr == -1){
      return '';
    }else{
      var action = eo.actionsLog[eo.currentPtr];
      return action.rollbackdata.currentParams;
    }
  }
  
  function processhighlightmode(depgraph,currentobj){
    if(depgraph.editObject.highlightMode){
      depgraph.editObject.clearSelection();
      var value = !isObjectPermanentHighlighted(currentobj);
      highlightObject(currentobj,value,true);
      
      if(depgraph.editObject.mode[depgraph.editObject.editMode].highlightInfos == null){
        depgraph.editObject.mode[depgraph.editObject.editMode].highlightInfos = depgraph.data.graph.highlighting?depgraph.data.graph.highlighting:[];
      }
      var infos = depgraph.editObject.mode[depgraph.editObject.editMode].highlightInfos;
      var index = infos.indexOf(currentobj.__data__.id);
      if(index != -1 && !value){
        infos.splice(index,1);
      }else if(index == -1 && value){
        infos.push(currentobj.__data__.id);
      }
      depgraph.editObject.setNeedToSave();
      return true;
    }else{
      return false;
    }
  }

  function removeLinkForNewData(depgraph,sentence,link){
    var source = depgraph.getWordByOriginalId(link.source);
    var target = depgraph.getWordByOriginalId(link.target);
    var source_data = source.__data__['#data'];
    var target_data = target.__data__['#data'];
    var param = "edge=" + 
      source_data['lemma'] + 
      "&" + source_data['cat'] + 
      "&" + link.label +
      "&" + target_data['lemma'] + 
      "&" + target_data['cat'] + 
      "&-8000";
    getNewData(depgraph,sentence,param);
    return param;
  }


  function createFRMGServerOptionData(sentence,desambigParams){
    if( Object.prototype.toString.call( desambigParams ) === '[object Array]' ) {
      desambigParams = desambigParams.join(" ");
    }
    return {
      sentence : sentence,
      options: 'xml ' + desambigParams,
      schema : 'dep',
      view: 'text',
      };
  }

  function getNewData(depgraph,sentence,options){
    var newdata;
    depgraph.viewer.ajaxStart();
    jQuery.ajax({
      type: 'GET', 
      url: urlFRMGServer,
      data: {
        sentence: sentence, 
        options: options,
        schema : 'dep',
        view : 'txt'
      },
      dataType : 'json',
      success: function(data, textStatus, jqXHR) {
        depgraph.resetData(data);
        depgraph.viewer.ajaxFinished();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(textStatus);
        depgraph.viewer.ajaxFinished();
      }
    });
  }

  function showAltLinks(depgraph,node){
    for(link in node.__data__['#data']['alternatives']){
      depgraph.data.graph.links.push(node.__data__['#data']['alternatives'][link]);
    }
    depgraph.update();
    depgraph.postProcesses();
    depgraph.editObject.init();
    depgraph.autoHighLightOnMouseOver();
    allLinksToGrey(depgraph,node.__data__['#data']['alternatives']);
  }


  function allLinksToGrey(depgraph,exceptions){
    if(exceptions == null){
      exceptions = [];
    }
    depgraph.vis.selectAll('g.link').each(function(d,i){
      for(i in exceptions){
        if(exceptions[i]['#id'] == d['#id']){
          this.components.path.attr('stroke-dasharray',"5,5");
          return;
        }
      }
      this.components.path.attr('stroke','grey');
    });
  }


  function hideAltLinks(depgraph,node){
    for(i in node.__data__['#data']['alternatives']){
      var link = node.__data__['#data']['alternatives'][i];
      var index = depgraph.getLinkIndexByOriginalId(link.id);
      if(index == null){
        return false;
      }
      depgraph.data.graph.links.splice(index,1);
    }
    depgraph.update();
    depgraph.postProcesses();
  }

  
}



