/**
 * mgwiki_graphs.js
 * This file contains javascript ajax function that will interact with FrMGWiki server functions,
 * and others convenient functions.
 */
(function(depgraphlib){


  depgraphlib.default_save = function(depgraph){
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
        depgraph.editObject.needToSaveState = false;
        depgraph.editObject.updateSaveState();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(textStatus);
      }
    });

  };
  
    /**
     * Callback to use in a toolbar button.
     * Display a box containing informations about the current graph.
     */
    depgraphlib.showRefs = function(){
      var me = depgraphlib.DepGraph.getInstance(this);
      var coords = this.getBoundingClientRect();
      var point = {x:coords.left,y:coords.top + coords.height + 2};
      var div ='<div>Reference Infos : <br>';
      div += 'Sentence : ' + fix_missing_a_closing_tag(me.sentenceLink) + '<br>'
      + 'Back Links : ' + me.refs
      +'</div>';
      div = jQuery(div);
      me.viewer.createBox({closeButton:true,position:point,autodestroy:true,forceToolbar:true}).setContent(div).open();
    };

    function fix_missing_a_closing_tag(link){
      if(link.indexOf('</a>', link.length - 4) !== -1){
        return link;
      }else{
        return link + '</a>';
      }
    }


    depgraphlib.mgwiki_d3js_module_action = function(action,gid,wsurl){
      jQuery.ajax({
        type: 'POST', 
        url: wsurl,
        data: {
          gid:gid,
          action:action,
        },
        dataType : action,
        complete: function(xhr,status){
          console.log(xhr);
          var answer = xhr.responseText;
          if(answer.success){
            window.location = '';
          }
        },
        success: function(data, textStatus, jqXHR) {
          console.log(data);
          if(data.success){
            window.location = '';
          }else{
            alert(data.error);
          }
        },
      });
    };
    
    depgraphlib.promote = function(gid,url){
      depgraphlib.mgwiki_d3js_module_action('promote',gid,url);
    };
    
    depgraphlib.reload = function(gid,url){
      depgraphlib.mgwiki_d3js_module_action('reload',gid,url);
    };

    depgraphlib.remove = function(gid,url){
      depgraphlib.mgwiki_d3js_module_action('remove',gid,url);
    };
  
}(window.depgraphlib));

