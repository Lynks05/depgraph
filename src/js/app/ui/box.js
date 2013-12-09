(function(depgraphlib){
  
  /***********************************************************/
  /**                   Quick Windows                        */
  /***********************************************************/
  
  /**
   * Create a new box and bind it with the viewer
   * @see Box for parameters description
   * @return the new box created
   */
  depgraphlib.GraphViewer.prototype.createBox = function(options){
    options.viewer = this;
    return new depgraphlib.Box(options);
  };
  
  /**
   * Box class
   * @param id the id of the box window
   * @param options the options for the box are : 
   * - draggable : bool, 
   * - position : float,float, 
   * - title : string, # displat a title
   * - closeButton : bool # true display a close button,
   * - autodestroy : bool # destroy the box when click away
   * @param viewer [optional] a viewer to bind the box with
   * @return {depgraphlib.Box}
   */
  depgraphlib.Box.prototype.init = function(options){
    var me = this;
    
    me.options = options;
    
    if(options.viewer != null){
      depgraphlib.Box.instances.push(this);
      this.viewer = options.viewer;
    }
    
    this.object = jQuery('<div class="depgraphlib-box"><div class="depgraphlib-box-header"></div><div class="depgraphlib-box-content"></div><div class="depgraphlib-box-footer"></div></div>');

    if(options.id){
      this.object.attr('id',options.id);
    }

    if(options.closeButton){
      var tooltipExitButton = jQuery('<div class="tooltip-exit-button"/>');
      tooltipExitButton.css('float','right');
      tooltipExitButton.css('display','block');
      tooltipExitButton.click(function(){me.close(true);});
      jQuery('.depgraphlib-box-header',this.object).append(tooltipExitButton);
    }
    
    if(options.position){
      this.object.css('top',options.position.y);
      this.object.css('left',options.position.x);
    }
    
    
    if(options.autodestroy){
      this.tooltipCreationBug = true;
      d3.select(document).on('click.box_'+depgraphlib.Box.instances.length,function(e){
        if(!me.tooltipCreationBug && !jQuery.contains( me.object[0], d3.event.originalTarget )){
          me.close(true);
        }
        delete me.tooltipCreationBug;
      });
    }
    
    
    jQuery('body').append(this.object);

    if(options.draggable){
      this.object.draggable({ cancel: ".depgraphlib-box-content" })
    }
    
    return this;
  };
  
  depgraphlib.Box.prototype.setContent = function(content){
    var boxcontent = jQuery('.depgraphlib-box-content',this.object);
    boxcontent.html(content.html());
    return this;
  };
  
  depgraphlib.Box.prototype.setHeader = function(content){
    return this;
  };
  
  depgraphlib.Box.prototype.setFooter = function(content){
    return this;
  };

  /**
   * Instances of boxes
   */
  depgraphlib.Box.instances = depgraphlib.Box.instances || [];

  /**
   * @function open
   * @param {DOMObject|object.<number,number>} position
   * @returns {depgraphlib.Box}
   * 
   * @memberof DepGraphLib.Box#
   */
  depgraphlib.Box.prototype.open = function(position){
    this.move(position);
    if(this.options.forceToolbar){
      if(this.viewer){
        this.oldFixedToolbarValue = this.viewer.fixedToolbar; 
        this.viewer.fixedToolbar = true;
        this.viewer.toolbar.show();
      }
    }
    this.object.show();
    return this;
  };

  depgraphlib.Box.prototype.move = function(position){
    if(position){
      var point = position;
      if(typeof position.getBoundingClientRect == 'function'){
        var coords = this.getBoundingClientRect();
        point = {x:coords.left,y:coords.top + coords.height + 2};
      }
      this.object.css('top',point.y);
      this.object.css('left',point.x);
    }
  }
  
  /**
   * 
   * @param raw if true, returns the dom element, else the jquery selection
   * @return the dom object corresponding to this box (jquery object or dom element depending of parameter)
   */
  depgraphlib.Box.prototype.getDOM = function(raw){
    if(raw){
      return this.dom;
    }
    else{
      return this.object;
    }
  };
  
  depgraphlib.Box.getBox = function(elt){
    for(var i=0; i< depgraphlib.Box.instances.length; ++i){
      if(jQuery.contains( depgraphlib.Box.instances[i].object[0], elt)){
        return depgraphlib.Box.instances[i];
      }
    }
  };
  
  /**
   * Close the window
   * @param destroy if true, destroy the window, else just hide it
   */
  depgraphlib.Box.prototype.close = function(destroy){
    if(this.options.forceToolbar){
      if(this.viewer){
        this.viewer.fixedToolbar = this.oldFixedToolbarValue; 
      }
    }
    if(destroy){
      this.destroy();
    }else{
      this.object.hide();
    }
  };
  
  
  /**
   * Close and destroy the window
   */
  depgraphlib.Box.prototype.destroy = function(){
    this.object.remove();
  };
  
  
  
  
  
  
  
  
  
  
  
}(window.depgraphlib));
