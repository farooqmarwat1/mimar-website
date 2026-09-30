// Garden Gnome Software - Skin
// Pano2VR 6.1.11/18043
// Filename: 2bed.ggsk
// Generated 2022-01-11T15:57:53

function pano2vrSkin(player,base) {
	player.addVariable('opt_hotspot_preview', 2, true);
	player.addVariable('opt_3d_preview', 2, true);
	var me=this;
	var skin=this;
	var flag=false;
	var nodeMarker=[];
	var activeNodeMarker=[];
	var hotspotTemplates={};
	var skinKeyPressed = 0;
	this.player=player;
	this.player.skinObj=this;
	this.divSkin=player.divSkin;
	this.ggUserdata=player.userdata;
	this.lastSize={ w: -1,h: -1 };
	var basePath="";
	// auto detect base path
	if (base=='?') {
		var scripts = document.getElementsByTagName('script');
		for(var i=0;i<scripts.length;i++) {
			var src=scripts[i].src;
			if (src.indexOf('skin.js')>=0) {
				var p=src.lastIndexOf('/');
				if (p>=0) {
					basePath=src.substr(0,p+1);
				}
			}
		}
	} else
	if (base) {
		basePath=base;
	}
	this.elementMouseDown=[];
	this.elementMouseOver=[];
	var cssPrefix='';
	var domTransition='transition';
	var domTransform='transform';
	var prefixes='Webkit,Moz,O,ms,Ms'.split(',');
	var i;
	var hs,el,els,elo,ela,elHorScrollFg,elHorScrollBg,elVertScrollFg,elVertScrollBg,elCornerBg;
	if (typeof document.body.style['transform'] == 'undefined') {
		for(var i=0;i<prefixes.length;i++) {
			if (typeof document.body.style[prefixes[i] + 'Transform'] !== 'undefined') {
				cssPrefix='-' + prefixes[i].toLowerCase() + '-';
				domTransition=prefixes[i] + 'Transition';
				domTransform=prefixes[i] + 'Transform';
			}
		}
	}
	
	player.setMargins(0,0,0,0);
	
	this.updateSize=function(startElement) {
		var stack=[];
		stack.push(startElement);
		while(stack.length>0) {
			var e=stack.pop();
			if (e.ggUpdatePosition) {
				e.ggUpdatePosition();
			}
			if (e.hasChildNodes()) {
				for(var i=0;i<e.childNodes.length;i++) {
					stack.push(e.childNodes[i]);
				}
			}
		}
	}
	
	this.callNodeChange=function(startElement) {
		var stack=[];
		stack.push(startElement);
		while(stack.length>0) {
			var e=stack.pop();
			if (e.ggNodeChange) {
				e.ggNodeChange();
			}
			if (e.hasChildNodes()) {
				for(var i=0;i<e.childNodes.length;i++) {
					stack.push(e.childNodes[i]);
				}
			}
		}
	}
	player.addListener('changenode', function() { me.ggUserdata=player.userdata; me.callNodeChange(me.divSkin); });
	
	var parameterToTransform=function(p) {
		var hs='translate(' + p.rx + 'px,' + p.ry + 'px) rotate(' + p.a + 'deg) scale(' + p.sx + ',' + p.sy + ')';
		return hs;
	}
	
	this.findElements=function(id,regex) {
		var r=[];
		var stack=[];
		var pat=new RegExp(id,'');
		stack.push(me.divSkin);
		while(stack.length>0) {
			var e=stack.pop();
			if (regex) {
				if (pat.test(e.ggId)) r.push(e);
			} else {
				if (e.ggId==id) r.push(e);
			}
			if (e.hasChildNodes()) {
				for(var i=0;i<e.childNodes.length;i++) {
					stack.push(e.childNodes[i]);
				}
			}
		}
		return r;
	}
	
	this.addSkin=function() {
		var hs='';
		this.ggCurrentTime=new Date().getTime();
		el=me._container_1=document.createElement('div');
		el.ggId="Container 1";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_container ";
		el.ggType='container';
		hs ='';
		hs+='height : 215px;';
		hs+='position : absolute;';
		hs+='right : 20px;';
		hs+='top : 70px;';
		hs+='visibility : hidden;';
		hs+='width : 250px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._container_1.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._container_1.ggUpdatePosition=function (useTransition) {
		}
		el=me._rectangle_1=document.createElement('div');
		el.ggId="Rectangle 1";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_rectangle ";
		el.ggType='rectangle';
		hs ='';
		hs+='background : rgba(0,0,0,0.196078);';
		hs+='border : 1px solid #000000;';
		hs+='cursor : default;';
		hs+='height : 215px;';
		hs+='position : absolute;';
		hs+='right : 0px;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 250px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._rectangle_1.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._rectangle_1.ggUpdatePosition=function (useTransition) {
		}
		me._container_1.appendChild(me._rectangle_1);
		el=me._image_1=document.createElement('div');
		els=me._image_1__img=document.createElement('img');
		els.className='ggskin ggskin_image_1';
		hs=basePath + 'images/image_1.png';
		els.setAttribute('src',hs);
		els.ggNormalSrc=hs;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_image';
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="Image 1";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_image ";
		el.ggType='image';
		hs ='';
		hs+='height : 215px;';
		hs+='position : absolute;';
		hs+='right : 0px;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 250px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._image_1.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._image_1.ggUpdatePosition=function (useTransition) {
		}
		el=me._marker_node6=document.createElement('div');
		el.ggMarkerNodeId='{node6}';
		el.ggMarkerInstances = [];
		nodeMarker.push(el);
		el.ggId="marker_node6";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_mark ";
		el.ggType='mark';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 0px;';
		hs+='left : 108px;';
		hs+='position : absolute;';
		hs+='top : 33px;';
		hs+='visibility : inherit;';
		hs+='width : 0px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._marker_node6.ggIsActive=function() {
			return this.ggIsMarkerActive==true;
		}
		el.ggElementNodeId=function() {
			var hs=String(this.ggMarkerNodeId);
			if (hs.charAt(0)=='{') { // }
				return hs.substr(1, hs.length - 2);
			}
			return '';
		}
		me._marker_node6.onclick=function (e) {
			player.openNext('{node6}');
		}
		me._marker_node6.onmouseover=function (e) {
			me.elementMouseOver['marker_node6']=true;
			me._marker_title6.logicBlock_visible();
		}
		me._marker_node6.onmouseout=function (e) {
			me.elementMouseOver['marker_node6']=false;
			me._marker_title6.logicBlock_visible();
		}
		me._marker_node6.ontouchend=function (e) {
			me.elementMouseOver['marker_node6']=false;
			me._marker_title6.logicBlock_visible();
		}
		me._marker_node6.ggUpdatePosition=function (useTransition) {
		}
		el=me._marker_title6=document.createElement('div');
		els=me._marker_title6__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="marker_title";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='z-index: 100;';
		hs+='height : 20px;';
		hs+='left : -35px;';
		hs+='position : absolute;';
		hs+='top : 35px;';
		hs+='visibility : hidden;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='top:  0px;';
		hs+='width: auto;';
		hs+='height: auto;';
		hs+='background: #000000;';
		hs+='background: rgba(0,0,0,0.666667);';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='text-align: center;';
		hs+='white-space: nowrap;';
		hs+='padding: 2px 5px 2px 5px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		els.innerHTML="Living Room";
		el.appendChild(els);
		me._marker_title6.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._marker_title6.logicBlock_position = function() {
			var newLogicStatePosition;
			if (
				((player.getHasTouch() == true))
			)
			{
				newLogicStatePosition = 0;
			}
			else {
				newLogicStatePosition = -1;
			}
			if (me._marker_title6.ggCurrentLogicStatePosition != newLogicStatePosition) {
				me._marker_title6.ggCurrentLogicStatePosition = newLogicStatePosition;
				me._marker_title6.style[domTransition]='left 0s, top 0s';
				if (me._marker_title6.ggCurrentLogicStatePosition == 0) {
					me._marker_title6.style.left='-35px';
					me._marker_title6.style.top='-25px';
				}
				else {
					me._marker_title6.style.left='-35px';
					me._marker_title6.style.top='35px';
				}
			}
		}
		me._marker_title6.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.elementMouseOver['marker_node6'] == true)) || 
				((me.elementMouseOver['marker_title6'] == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._marker_title6.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._marker_title6.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._marker_title6.style[domTransition]='left 0s, top 0s';
				if (me._marker_title6.ggCurrentLogicStateVisible == 0) {
					me._marker_title6.style.visibility=(Number(me._marker_title6.style.opacity)>0||!me._marker_title6.style.opacity)?'inherit':'hidden';
					me._marker_title6.ggVisible=true;
				}
				else {
					me._marker_title6.style.visibility="hidden";
					me._marker_title6.ggVisible=false;
				}
			}
		}
		me._marker_title6.onmouseover=function (e) {
			me.elementMouseOver['marker_title6']=true;
			me._marker_title6.logicBlock_visible();
		}
		me._marker_title6.onmouseout=function (e) {
			if (e && e.toElement) {
				var current = e.toElement;
				while (current = current.parentNode) {
				if (current == me._marker_title6__text)
					return;
				}
			}
			me.elementMouseOver['marker_title6']=false;
			me._marker_title6.logicBlock_visible();
		}
		me._marker_title6.ontouchend=function (e) {
			me.elementMouseOver['marker_title6']=false;
			me._marker_title6.logicBlock_visible();
		}
		me._marker_title6.ggUpdatePosition=function (useTransition) {
			this.style[domTransition]='left 0';
			this.ggTextDiv.style.left=((98-this.ggTextDiv.offsetWidth)/2) + 'px';
		}
		me._marker_node6.appendChild(me._marker_title6);
		me._image_1.appendChild(me._marker_node6);
		el=me._marker_node5=document.createElement('div');
		el.ggMarkerNodeId='{node5}';
		el.ggMarkerInstances = [];
		nodeMarker.push(el);
		el.ggId="marker_node5";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_mark ";
		el.ggType='mark';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 0px;';
		hs+='left : 116px;';
		hs+='position : absolute;';
		hs+='top : 141px;';
		hs+='visibility : inherit;';
		hs+='width : 0px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._marker_node5.ggIsActive=function() {
			return this.ggIsMarkerActive==true;
		}
		el.ggElementNodeId=function() {
			var hs=String(this.ggMarkerNodeId);
			if (hs.charAt(0)=='{') { // }
				return hs.substr(1, hs.length - 2);
			}
			return '';
		}
		me._marker_node5.onclick=function (e) {
			player.openNext('{node5}');
		}
		me._marker_node5.onmouseover=function (e) {
			me.elementMouseOver['marker_node5']=true;
			me._marker_title5.logicBlock_visible();
		}
		me._marker_node5.onmouseout=function (e) {
			me.elementMouseOver['marker_node5']=false;
			me._marker_title5.logicBlock_visible();
		}
		me._marker_node5.ontouchend=function (e) {
			me.elementMouseOver['marker_node5']=false;
			me._marker_title5.logicBlock_visible();
		}
		me._marker_node5.ggUpdatePosition=function (useTransition) {
		}
		el=me._marker_title5=document.createElement('div');
		els=me._marker_title5__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="marker_title";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='z-index: 100;';
		hs+='height : 20px;';
		hs+='left : -35px;';
		hs+='position : absolute;';
		hs+='top : 35px;';
		hs+='visibility : hidden;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='top:  0px;';
		hs+='width: auto;';
		hs+='height: auto;';
		hs+='background: #000000;';
		hs+='background: rgba(0,0,0,0.666667);';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='text-align: center;';
		hs+='white-space: nowrap;';
		hs+='padding: 2px 5px 2px 5px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		els.innerHTML="Kitchen";
		el.appendChild(els);
		me._marker_title5.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._marker_title5.logicBlock_position = function() {
			var newLogicStatePosition;
			if (
				((player.getHasTouch() == true))
			)
			{
				newLogicStatePosition = 0;
			}
			else {
				newLogicStatePosition = -1;
			}
			if (me._marker_title5.ggCurrentLogicStatePosition != newLogicStatePosition) {
				me._marker_title5.ggCurrentLogicStatePosition = newLogicStatePosition;
				me._marker_title5.style[domTransition]='left 0s, top 0s';
				if (me._marker_title5.ggCurrentLogicStatePosition == 0) {
					me._marker_title5.style.left='-35px';
					me._marker_title5.style.top='-25px';
				}
				else {
					me._marker_title5.style.left='-35px';
					me._marker_title5.style.top='35px';
				}
			}
		}
		me._marker_title5.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.elementMouseOver['marker_node5'] == true)) || 
				((me.elementMouseOver['marker_title5'] == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._marker_title5.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._marker_title5.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._marker_title5.style[domTransition]='left 0s, top 0s';
				if (me._marker_title5.ggCurrentLogicStateVisible == 0) {
					me._marker_title5.style.visibility=(Number(me._marker_title5.style.opacity)>0||!me._marker_title5.style.opacity)?'inherit':'hidden';
					me._marker_title5.ggVisible=true;
				}
				else {
					me._marker_title5.style.visibility="hidden";
					me._marker_title5.ggVisible=false;
				}
			}
		}
		me._marker_title5.onmouseover=function (e) {
			me.elementMouseOver['marker_title5']=true;
			me._marker_title5.logicBlock_visible();
		}
		me._marker_title5.onmouseout=function (e) {
			if (e && e.toElement) {
				var current = e.toElement;
				while (current = current.parentNode) {
				if (current == me._marker_title5__text)
					return;
				}
			}
			me.elementMouseOver['marker_title5']=false;
			me._marker_title5.logicBlock_visible();
		}
		me._marker_title5.ontouchend=function (e) {
			me.elementMouseOver['marker_title5']=false;
			me._marker_title5.logicBlock_visible();
		}
		me._marker_title5.ggUpdatePosition=function (useTransition) {
			this.style[domTransition]='left 0';
			this.ggTextDiv.style.left=((98-this.ggTextDiv.offsetWidth)/2) + 'px';
		}
		me._marker_node5.appendChild(me._marker_title5);
		me._image_1.appendChild(me._marker_node5);
		el=me._marker_node4=document.createElement('div');
		el.ggMarkerNodeId='{node4}';
		el.ggMarkerInstances = [];
		nodeMarker.push(el);
		el.ggId="marker_node4";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_mark ";
		el.ggType='mark';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 0px;';
		hs+='left : 34px;';
		hs+='position : absolute;';
		hs+='top : 34px;';
		hs+='visibility : inherit;';
		hs+='width : 0px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._marker_node4.ggIsActive=function() {
			return this.ggIsMarkerActive==true;
		}
		el.ggElementNodeId=function() {
			var hs=String(this.ggMarkerNodeId);
			if (hs.charAt(0)=='{') { // }
				return hs.substr(1, hs.length - 2);
			}
			return '';
		}
		me._marker_node4.onclick=function (e) {
			player.openNext('{node4}');
		}
		me._marker_node4.onmouseover=function (e) {
			me.elementMouseOver['marker_node4']=true;
			me._marker_title4.logicBlock_visible();
		}
		me._marker_node4.onmouseout=function (e) {
			me.elementMouseOver['marker_node4']=false;
			me._marker_title4.logicBlock_visible();
		}
		me._marker_node4.ontouchend=function (e) {
			me.elementMouseOver['marker_node4']=false;
			me._marker_title4.logicBlock_visible();
		}
		me._marker_node4.ggUpdatePosition=function (useTransition) {
		}
		el=me._marker_title4=document.createElement('div');
		els=me._marker_title4__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="marker_title";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='z-index: 100;';
		hs+='height : 20px;';
		hs+='left : -35px;';
		hs+='position : absolute;';
		hs+='top : 35px;';
		hs+='visibility : hidden;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='top:  0px;';
		hs+='width: auto;';
		hs+='height: auto;';
		hs+='background: #000000;';
		hs+='background: rgba(0,0,0,0.666667);';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='text-align: center;';
		hs+='white-space: nowrap;';
		hs+='padding: 2px 5px 2px 5px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		els.innerHTML="Bedroom 2";
		el.appendChild(els);
		me._marker_title4.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._marker_title4.logicBlock_position = function() {
			var newLogicStatePosition;
			if (
				((player.getHasTouch() == true))
			)
			{
				newLogicStatePosition = 0;
			}
			else {
				newLogicStatePosition = -1;
			}
			if (me._marker_title4.ggCurrentLogicStatePosition != newLogicStatePosition) {
				me._marker_title4.ggCurrentLogicStatePosition = newLogicStatePosition;
				me._marker_title4.style[domTransition]='left 0s, top 0s';
				if (me._marker_title4.ggCurrentLogicStatePosition == 0) {
					me._marker_title4.style.left='-35px';
					me._marker_title4.style.top='-25px';
				}
				else {
					me._marker_title4.style.left='-35px';
					me._marker_title4.style.top='35px';
				}
			}
		}
		me._marker_title4.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.elementMouseOver['marker_node4'] == true)) || 
				((me.elementMouseOver['marker_title4'] == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._marker_title4.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._marker_title4.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._marker_title4.style[domTransition]='left 0s, top 0s';
				if (me._marker_title4.ggCurrentLogicStateVisible == 0) {
					me._marker_title4.style.visibility=(Number(me._marker_title4.style.opacity)>0||!me._marker_title4.style.opacity)?'inherit':'hidden';
					me._marker_title4.ggVisible=true;
				}
				else {
					me._marker_title4.style.visibility="hidden";
					me._marker_title4.ggVisible=false;
				}
			}
		}
		me._marker_title4.onmouseover=function (e) {
			me.elementMouseOver['marker_title4']=true;
			me._marker_title4.logicBlock_visible();
		}
		me._marker_title4.onmouseout=function (e) {
			if (e && e.toElement) {
				var current = e.toElement;
				while (current = current.parentNode) {
				if (current == me._marker_title4__text)
					return;
				}
			}
			me.elementMouseOver['marker_title4']=false;
			me._marker_title4.logicBlock_visible();
		}
		me._marker_title4.ontouchend=function (e) {
			me.elementMouseOver['marker_title4']=false;
			me._marker_title4.logicBlock_visible();
		}
		me._marker_title4.ggUpdatePosition=function (useTransition) {
			this.style[domTransition]='left 0';
			this.ggTextDiv.style.left=((98-this.ggTextDiv.offsetWidth)/2) + 'px';
		}
		me._marker_node4.appendChild(me._marker_title4);
		me._image_1.appendChild(me._marker_node4);
		el=me._marker_node3=document.createElement('div');
		el.ggMarkerNodeId='{node3}';
		el.ggMarkerInstances = [];
		nodeMarker.push(el);
		el.ggId="marker_node3";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_mark ";
		el.ggType='mark';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 0px;';
		hs+='left : 21px;';
		hs+='position : absolute;';
		hs+='top : 126px;';
		hs+='visibility : inherit;';
		hs+='width : 0px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._marker_node3.ggIsActive=function() {
			return this.ggIsMarkerActive==true;
		}
		el.ggElementNodeId=function() {
			var hs=String(this.ggMarkerNodeId);
			if (hs.charAt(0)=='{') { // }
				return hs.substr(1, hs.length - 2);
			}
			return '';
		}
		me._marker_node3.onclick=function (e) {
			player.openNext('{node3}');
		}
		me._marker_node3.onmouseover=function (e) {
			me.elementMouseOver['marker_node3']=true;
			me._marker_title3.logicBlock_visible();
		}
		me._marker_node3.onmouseout=function (e) {
			me.elementMouseOver['marker_node3']=false;
			me._marker_title3.logicBlock_visible();
		}
		me._marker_node3.ontouchend=function (e) {
			me.elementMouseOver['marker_node3']=false;
			me._marker_title3.logicBlock_visible();
		}
		me._marker_node3.ggUpdatePosition=function (useTransition) {
		}
		el=me._marker_title3=document.createElement('div');
		els=me._marker_title3__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="marker_title";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='z-index: 100;';
		hs+='height : 20px;';
		hs+='left : -35px;';
		hs+='position : absolute;';
		hs+='top : 35px;';
		hs+='visibility : hidden;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='top:  0px;';
		hs+='width: auto;';
		hs+='height: auto;';
		hs+='background: #000000;';
		hs+='background: rgba(0,0,0,0.666667);';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='text-align: center;';
		hs+='white-space: nowrap;';
		hs+='padding: 2px 5px 2px 5px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		els.innerHTML="Bath 2";
		el.appendChild(els);
		me._marker_title3.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._marker_title3.logicBlock_position = function() {
			var newLogicStatePosition;
			if (
				((player.getHasTouch() == true))
			)
			{
				newLogicStatePosition = 0;
			}
			else {
				newLogicStatePosition = -1;
			}
			if (me._marker_title3.ggCurrentLogicStatePosition != newLogicStatePosition) {
				me._marker_title3.ggCurrentLogicStatePosition = newLogicStatePosition;
				me._marker_title3.style[domTransition]='left 0s, top 0s';
				if (me._marker_title3.ggCurrentLogicStatePosition == 0) {
					me._marker_title3.style.left='-35px';
					me._marker_title3.style.top='-25px';
				}
				else {
					me._marker_title3.style.left='-35px';
					me._marker_title3.style.top='35px';
				}
			}
		}
		me._marker_title3.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.elementMouseOver['marker_node3'] == true)) || 
				((me.elementMouseOver['marker_title3'] == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._marker_title3.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._marker_title3.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._marker_title3.style[domTransition]='left 0s, top 0s';
				if (me._marker_title3.ggCurrentLogicStateVisible == 0) {
					me._marker_title3.style.visibility=(Number(me._marker_title3.style.opacity)>0||!me._marker_title3.style.opacity)?'inherit':'hidden';
					me._marker_title3.ggVisible=true;
				}
				else {
					me._marker_title3.style.visibility="hidden";
					me._marker_title3.ggVisible=false;
				}
			}
		}
		me._marker_title3.onmouseover=function (e) {
			me.elementMouseOver['marker_title3']=true;
			me._marker_title3.logicBlock_visible();
		}
		me._marker_title3.onmouseout=function (e) {
			if (e && e.toElement) {
				var current = e.toElement;
				while (current = current.parentNode) {
				if (current == me._marker_title3__text)
					return;
				}
			}
			me.elementMouseOver['marker_title3']=false;
			me._marker_title3.logicBlock_visible();
		}
		me._marker_title3.ontouchend=function (e) {
			me.elementMouseOver['marker_title3']=false;
			me._marker_title3.logicBlock_visible();
		}
		me._marker_title3.ggUpdatePosition=function (useTransition) {
			this.style[domTransition]='left 0';
			this.ggTextDiv.style.left=((98-this.ggTextDiv.offsetWidth)/2) + 'px';
		}
		me._marker_node3.appendChild(me._marker_title3);
		me._image_1.appendChild(me._marker_node3);
		el=me._marker_node1=document.createElement('div');
		el.ggMarkerNodeId='{node1}';
		el.ggMarkerInstances = [];
		nodeMarker.push(el);
		el.ggId="marker_node1";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_mark ";
		el.ggType='mark';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 0px;';
		hs+='left : 185px;';
		hs+='position : absolute;';
		hs+='top : 33px;';
		hs+='visibility : inherit;';
		hs+='width : 0px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._marker_node1.ggIsActive=function() {
			return this.ggIsMarkerActive==true;
		}
		el.ggElementNodeId=function() {
			var hs=String(this.ggMarkerNodeId);
			if (hs.charAt(0)=='{') { // }
				return hs.substr(1, hs.length - 2);
			}
			return '';
		}
		me._marker_node1.onclick=function (e) {
			player.openNext('{node1}');
		}
		me._marker_node1.onmouseover=function (e) {
			me.elementMouseOver['marker_node1']=true;
			me._marker_title2.logicBlock_visible();
		}
		me._marker_node1.onmouseout=function (e) {
			me.elementMouseOver['marker_node1']=false;
			me._marker_title2.logicBlock_visible();
		}
		me._marker_node1.ontouchend=function (e) {
			me.elementMouseOver['marker_node1']=false;
			me._marker_title2.logicBlock_visible();
		}
		me._marker_node1.ggUpdatePosition=function (useTransition) {
		}
		el=me._marker_title2=document.createElement('div');
		els=me._marker_title2__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="marker_title";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='z-index: 100;';
		hs+='height : 20px;';
		hs+='left : -35px;';
		hs+='position : absolute;';
		hs+='top : 35px;';
		hs+='visibility : hidden;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='top:  0px;';
		hs+='width: auto;';
		hs+='height: auto;';
		hs+='background: #000000;';
		hs+='background: rgba(0,0,0,0.666667);';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='text-align: center;';
		hs+='white-space: nowrap;';
		hs+='padding: 2px 5px 2px 5px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		els.innerHTML="Bedroom 1";
		el.appendChild(els);
		me._marker_title2.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._marker_title2.logicBlock_position = function() {
			var newLogicStatePosition;
			if (
				((player.getHasTouch() == true))
			)
			{
				newLogicStatePosition = 0;
			}
			else {
				newLogicStatePosition = -1;
			}
			if (me._marker_title2.ggCurrentLogicStatePosition != newLogicStatePosition) {
				me._marker_title2.ggCurrentLogicStatePosition = newLogicStatePosition;
				me._marker_title2.style[domTransition]='left 0s, top 0s';
				if (me._marker_title2.ggCurrentLogicStatePosition == 0) {
					me._marker_title2.style.left='-35px';
					me._marker_title2.style.top='-25px';
				}
				else {
					me._marker_title2.style.left='-35px';
					me._marker_title2.style.top='35px';
				}
			}
		}
		me._marker_title2.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.elementMouseOver['marker_node1'] == true)) || 
				((me.elementMouseOver['marker_title2'] == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._marker_title2.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._marker_title2.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._marker_title2.style[domTransition]='left 0s, top 0s';
				if (me._marker_title2.ggCurrentLogicStateVisible == 0) {
					me._marker_title2.style.visibility=(Number(me._marker_title2.style.opacity)>0||!me._marker_title2.style.opacity)?'inherit':'hidden';
					me._marker_title2.ggVisible=true;
				}
				else {
					me._marker_title2.style.visibility="hidden";
					me._marker_title2.ggVisible=false;
				}
			}
		}
		me._marker_title2.onmouseover=function (e) {
			me.elementMouseOver['marker_title2']=true;
			me._marker_title2.logicBlock_visible();
		}
		me._marker_title2.onmouseout=function (e) {
			if (e && e.toElement) {
				var current = e.toElement;
				while (current = current.parentNode) {
				if (current == me._marker_title2__text)
					return;
				}
			}
			me.elementMouseOver['marker_title2']=false;
			me._marker_title2.logicBlock_visible();
		}
		me._marker_title2.ontouchend=function (e) {
			me.elementMouseOver['marker_title2']=false;
			me._marker_title2.logicBlock_visible();
		}
		me._marker_title2.ggUpdatePosition=function (useTransition) {
			this.style[domTransition]='left 0';
			this.ggTextDiv.style.left=((98-this.ggTextDiv.offsetWidth)/2) + 'px';
		}
		me._marker_node1.appendChild(me._marker_title2);
		me._image_1.appendChild(me._marker_node1);
		el=me._marker_node2=document.createElement('div');
		el.ggMarkerNodeId='{node2}';
		el.ggMarkerInstances = [];
		nodeMarker.push(el);
		el.ggId="marker_node2";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_mark ";
		el.ggType='mark';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 0px;';
		hs+='left : 177px;';
		hs+='position : absolute;';
		hs+='top : 115px;';
		hs+='visibility : inherit;';
		hs+='width : 0px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._marker_node2.ggIsActive=function() {
			return this.ggIsMarkerActive==true;
		}
		el.ggElementNodeId=function() {
			var hs=String(this.ggMarkerNodeId);
			if (hs.charAt(0)=='{') { // }
				return hs.substr(1, hs.length - 2);
			}
			return '';
		}
		me._marker_node2.onclick=function (e) {
			player.openNext('{node2}');
		}
		me._marker_node2.onmouseover=function (e) {
			me.elementMouseOver['marker_node2']=true;
			me._marker_title1.logicBlock_visible();
		}
		me._marker_node2.onmouseout=function (e) {
			me.elementMouseOver['marker_node2']=false;
			me._marker_title1.logicBlock_visible();
		}
		me._marker_node2.ontouchend=function (e) {
			me.elementMouseOver['marker_node2']=false;
			me._marker_title1.logicBlock_visible();
		}
		me._marker_node2.ggUpdatePosition=function (useTransition) {
		}
		el=me._marker_title1=document.createElement('div');
		els=me._marker_title1__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="marker_title";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='z-index: 100;';
		hs+='height : 20px;';
		hs+='left : -28px;';
		hs+='position : absolute;';
		hs+='top : 34px;';
		hs+='visibility : hidden;';
		hs+='width : 85px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='top:  0px;';
		hs+='width: auto;';
		hs+='height: auto;';
		hs+='background: #000000;';
		hs+='background: rgba(0,0,0,0.666667);';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='text-align: center;';
		hs+='white-space: nowrap;';
		hs+='padding: 2px 5px 2px 5px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		els.innerHTML="Bath 1";
		el.appendChild(els);
		me._marker_title1.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._marker_title1.logicBlock_position = function() {
			var newLogicStatePosition;
			if (
				((player.getHasTouch() == true))
			)
			{
				newLogicStatePosition = 0;
			}
			else {
				newLogicStatePosition = -1;
			}
			if (me._marker_title1.ggCurrentLogicStatePosition != newLogicStatePosition) {
				me._marker_title1.ggCurrentLogicStatePosition = newLogicStatePosition;
				me._marker_title1.style[domTransition]='left 0s, top 0s';
				if (me._marker_title1.ggCurrentLogicStatePosition == 0) {
					me._marker_title1.style.left='-35px';
					me._marker_title1.style.top='-25px';
				}
				else {
					me._marker_title1.style.left='-28px';
					me._marker_title1.style.top='34px';
				}
			}
		}
		me._marker_title1.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.elementMouseOver['marker_node2'] == true)) || 
				((me.elementMouseOver['marker_title1'] == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._marker_title1.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._marker_title1.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._marker_title1.style[domTransition]='left 0s, top 0s';
				if (me._marker_title1.ggCurrentLogicStateVisible == 0) {
					me._marker_title1.style.visibility=(Number(me._marker_title1.style.opacity)>0||!me._marker_title1.style.opacity)?'inherit':'hidden';
					me._marker_title1.ggVisible=true;
				}
				else {
					me._marker_title1.style.visibility="hidden";
					me._marker_title1.ggVisible=false;
				}
			}
		}
		me._marker_title1.onmouseover=function (e) {
			me.elementMouseOver['marker_title1']=true;
			me._marker_title1.logicBlock_visible();
		}
		me._marker_title1.onmouseout=function (e) {
			if (e && e.toElement) {
				var current = e.toElement;
				while (current = current.parentNode) {
				if (current == me._marker_title1__text)
					return;
				}
			}
			me.elementMouseOver['marker_title1']=false;
			me._marker_title1.logicBlock_visible();
		}
		me._marker_title1.ontouchend=function (e) {
			me.elementMouseOver['marker_title1']=false;
			me._marker_title1.logicBlock_visible();
		}
		me._marker_title1.ggUpdatePosition=function (useTransition) {
			this.style[domTransition]='left 0';
			this.ggTextDiv.style.left=((83-this.ggTextDiv.offsetWidth)/2) + 'px';
		}
		me._marker_node2.appendChild(me._marker_title1);
		me._image_1.appendChild(me._marker_node2);
		el=me._marker_node7=document.createElement('div');
		el.ggMarkerNodeId='{node7}';
		el.ggMarkerInstances = [];
		nodeMarker.push(el);
		el.ggId="marker_node7";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_mark ";
		el.ggType='mark';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 0px;';
		hs+='left : 53px;';
		hs+='position : absolute;';
		hs+='top : 140px;';
		hs+='visibility : inherit;';
		hs+='width : 0px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._marker_node7.ggIsActive=function() {
			return this.ggIsMarkerActive==true;
		}
		el.ggElementNodeId=function() {
			var hs=String(this.ggMarkerNodeId);
			if (hs.charAt(0)=='{') { // }
				return hs.substr(1, hs.length - 2);
			}
			return '';
		}
		me._marker_node7.onclick=function (e) {
			player.openNext('{node7}');
		}
		me._marker_node7.onmouseover=function (e) {
			me.elementMouseOver['marker_node7']=true;
			me._marker_title0.logicBlock_visible();
		}
		me._marker_node7.onmouseout=function (e) {
			me.elementMouseOver['marker_node7']=false;
			me._marker_title0.logicBlock_visible();
		}
		me._marker_node7.ontouchend=function (e) {
			me.elementMouseOver['marker_node7']=false;
			me._marker_title0.logicBlock_visible();
		}
		me._marker_node7.ggUpdatePosition=function (useTransition) {
		}
		el=me._marker_title0=document.createElement('div');
		els=me._marker_title0__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="marker_title";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='z-index: 100;';
		hs+='height : 20px;';
		hs+='left : -35px;';
		hs+='position : absolute;';
		hs+='top : 35px;';
		hs+='visibility : hidden;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='top:  0px;';
		hs+='width: auto;';
		hs+='height: auto;';
		hs+='background: #000000;';
		hs+='background: rgba(0,0,0,0.666667);';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='text-align: center;';
		hs+='white-space: nowrap;';
		hs+='padding: 2px 5px 2px 5px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		els.innerHTML="Powder Room";
		el.appendChild(els);
		me._marker_title0.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._marker_title0.logicBlock_position = function() {
			var newLogicStatePosition;
			if (
				((player.getHasTouch() == true))
			)
			{
				newLogicStatePosition = 0;
			}
			else {
				newLogicStatePosition = -1;
			}
			if (me._marker_title0.ggCurrentLogicStatePosition != newLogicStatePosition) {
				me._marker_title0.ggCurrentLogicStatePosition = newLogicStatePosition;
				me._marker_title0.style[domTransition]='left 0s, top 0s';
				if (me._marker_title0.ggCurrentLogicStatePosition == 0) {
					me._marker_title0.style.left='-35px';
					me._marker_title0.style.top='-25px';
				}
				else {
					me._marker_title0.style.left='-35px';
					me._marker_title0.style.top='35px';
				}
			}
		}
		me._marker_title0.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.elementMouseOver['marker_node7'] == true)) || 
				((me.elementMouseOver['marker_title0'] == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._marker_title0.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._marker_title0.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._marker_title0.style[domTransition]='left 0s, top 0s';
				if (me._marker_title0.ggCurrentLogicStateVisible == 0) {
					me._marker_title0.style.visibility=(Number(me._marker_title0.style.opacity)>0||!me._marker_title0.style.opacity)?'inherit':'hidden';
					me._marker_title0.ggVisible=true;
				}
				else {
					me._marker_title0.style.visibility="hidden";
					me._marker_title0.ggVisible=false;
				}
			}
		}
		me._marker_title0.onmouseover=function (e) {
			me.elementMouseOver['marker_title0']=true;
			me._marker_title0.logicBlock_visible();
		}
		me._marker_title0.onmouseout=function (e) {
			if (e && e.toElement) {
				var current = e.toElement;
				while (current = current.parentNode) {
				if (current == me._marker_title0__text)
					return;
				}
			}
			me.elementMouseOver['marker_title0']=false;
			me._marker_title0.logicBlock_visible();
		}
		me._marker_title0.ontouchend=function (e) {
			me.elementMouseOver['marker_title0']=false;
			me._marker_title0.logicBlock_visible();
		}
		me._marker_title0.ggUpdatePosition=function (useTransition) {
			this.style[domTransition]='left 0';
			this.ggTextDiv.style.left=((98-this.ggTextDiv.offsetWidth)/2) + 'px';
		}
		me._marker_node7.appendChild(me._marker_title0);
		me._image_1.appendChild(me._marker_node7);
		me._container_1.appendChild(me._image_1);
		me.divSkin.appendChild(me._container_1);
		el=me._text_1=document.createElement('div');
		els=me._text_1__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="Text 1";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='height : 23px;';
		hs+='position : absolute;';
		hs+='right : 20px;';
		hs+='top : 30px;';
		hs+='visibility : inherit;';
		hs+='width : 170px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='right: 0px;';
		hs+='top:  0px;';
		hs+='width: 172px;';
		hs+='height: 25px;';
		hs+='background: #333333;';
		hs+='border: 1px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='font-size: 16px;';
		hs+='font-weight: inherit;';
		hs+='text-align: center;';
		hs+='white-space: nowrap;';
		hs+='padding: 0px 1px 0px 1px;';
		hs+='overflow: hidden;';
		hs+='overflow-y: auto;';
		els.setAttribute('style',hs);
		els.innerHTML="Toggle Map";
		el.appendChild(els);
		me._text_1.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._text_1.onclick=function (e) {
			me._container_1.ggVisible = !me._container_1.ggVisible;
			var flag=me._container_1.ggVisible;
			me._container_1.style[domTransition]='none';
			me._container_1.style.visibility=((flag)&&(Number(me._container_1.style.opacity)>0||!me._container_1.style.opacity))?'inherit':'hidden';
		}
		me._text_1.ggUpdatePosition=function (useTransition) {
		}
		me.divSkin.appendChild(me._text_1);
		el=me._hide_template=document.createElement('div');
		el.ggId="hide_template";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_container ";
		el.ggType='container';
		hs ='';
		hs+='height : 45px;';
		hs+='left : 0px;';
		hs+='overflow : hidden;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : hidden;';
		hs+='width : 187px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._hide_template.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._hide_template.ggUpdatePosition=function (useTransition) {
		}
		el=me._markertemplate=document.createElement('div');
		el.ggMarkerNodeId='';
		el.ggMarkerInstances = [];
		nodeMarker.push(el);
		el.ggId="markertemplate";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_mark ";
		el.ggType='mark';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 0px;';
		hs+='left : 60px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 0px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._markertemplate.ggIsActive=function() {
			return this.ggIsMarkerActive==true;
		}
		el.ggElementNodeId=function() {
			var hs=String(this.ggMarkerNodeId);
			if (hs.charAt(0)=='{') { // }
				return hs.substr(1, hs.length - 2);
			}
			return '';
		}
		me._markertemplate.onmouseover=function (e) {
			me.elementMouseOver['markertemplate']=true;
			me._marker_title.logicBlock_visible();
		}
		me._markertemplate.onmouseout=function (e) {
			me.elementMouseOver['markertemplate']=false;
			me._marker_title.logicBlock_visible();
		}
		me._markertemplate.ontouchend=function (e) {
			me.elementMouseOver['markertemplate']=false;
			me._marker_title.logicBlock_visible();
		}
		me._markertemplate.ggUpdatePosition=function (useTransition) {
		}
		el=me._marker_title=document.createElement('div');
		els=me._marker_title__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="marker_title";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='z-index: 100;';
		hs+='height : 20px;';
		hs+='left : -35px;';
		hs+='position : absolute;';
		hs+='top : 35px;';
		hs+='visibility : hidden;';
		hs+='width : 100px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='top:  0px;';
		hs+='width: auto;';
		hs+='height: auto;';
		hs+='background: #000000;';
		hs+='background: rgba(0,0,0,0.666667);';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='text-align: center;';
		hs+='white-space: nowrap;';
		hs+='padding: 2px 5px 2px 5px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		me._marker_title.ggUpdateText=function() {
			var hs=me.ggUserdata.title;
			if (hs!=this.ggText) {
				this.ggText=hs;
				this.ggTextDiv.innerHTML=hs;
				if (this.ggUpdatePosition) this.ggUpdatePosition();
			}
		}
		me._marker_title.ggUpdateText();
		player.addListener('changenode', function() {
			me._marker_title.ggUpdateText();
		});
		el.appendChild(els);
		me._marker_title.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._marker_title.logicBlock_position = function() {
			var newLogicStatePosition;
			if (
				((player.getHasTouch() == true))
			)
			{
				newLogicStatePosition = 0;
			}
			else {
				newLogicStatePosition = -1;
			}
			if (me._marker_title.ggCurrentLogicStatePosition != newLogicStatePosition) {
				me._marker_title.ggCurrentLogicStatePosition = newLogicStatePosition;
				me._marker_title.style[domTransition]='left 0s, top 0s';
				if (me._marker_title.ggCurrentLogicStatePosition == 0) {
					me._marker_title.style.left='-35px';
					me._marker_title.style.top='-25px';
				}
				else {
					me._marker_title.style.left='-35px';
					me._marker_title.style.top='35px';
				}
			}
		}
		me._marker_title.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.elementMouseOver['markertemplate'] == true)) || 
				((me.elementMouseOver['marker_title'] == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._marker_title.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._marker_title.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._marker_title.style[domTransition]='left 0s, top 0s';
				if (me._marker_title.ggCurrentLogicStateVisible == 0) {
					me._marker_title.style.visibility=(Number(me._marker_title.style.opacity)>0||!me._marker_title.style.opacity)?'inherit':'hidden';
					me._marker_title.ggVisible=true;
				}
				else {
					me._marker_title.style.visibility="hidden";
					me._marker_title.ggVisible=false;
				}
			}
		}
		me._marker_title.onmouseover=function (e) {
			me.elementMouseOver['marker_title']=true;
			me._marker_title.logicBlock_visible();
		}
		me._marker_title.onmouseout=function (e) {
			if (e && e.toElement) {
				var current = e.toElement;
				while (current = current.parentNode) {
				if (current == me._marker_title__text)
					return;
				}
			}
			me.elementMouseOver['marker_title']=false;
			me._marker_title.logicBlock_visible();
		}
		me._marker_title.ontouchend=function (e) {
			me.elementMouseOver['marker_title']=false;
			me._marker_title.logicBlock_visible();
		}
		me._marker_title.ggUpdatePosition=function (useTransition) {
			this.style[domTransition]='left 0';
			this.ggTextDiv.style.left=((98-this.ggTextDiv.offsetWidth)/2) + 'px';
		}
		me._markertemplate.appendChild(me._marker_title);
		me._hide_template.appendChild(me._markertemplate);
		me.divSkin.appendChild(me._hide_template);
		el=me._gyro=document.createElement('div');
		el.ggId="gyro";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_container ";
		el.ggType='container';
		hs ='';
		hs+='bottom : 20px;';
		hs+='height : 32px;';
		hs+='position : absolute;';
		hs+='right : 20px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._gyro.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._gyro.onclick=function (e) {
			player.setUseGyro(!(player.getUseGyro()));
		}
		me._gyro.ggUpdatePosition=function (useTransition) {
		}
		el=me._gyro_on=document.createElement('div');
		els=me._gyro_on__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEzMCAxMzA7IiB2aWV3Qm94PSIwIDAgMTMwIDEzMCIgeT0iMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgaWQ9IkxheWVyXzEiIHhtbDpzcGFjZT0icH'+
			'Jlc2VydmUiPgogPGcgaWQ9IkxheWVyXzFfMV8iLz4KIDxnIGlkPSJMYXllcl8yXzFfIj4KICA8Zz4KICAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTEwMy41LDU5LjRjLTEuOS0xLjktNC45LTMuOC04LjYtNS40Yy00LjEtMS44LTkuMi0zLjItMTQuOS00LjFjMS4yLDMuNiwyLjMsNy41LDMuMSwxMS42YzEuMSw1LjYsMS42LDExLDEuNywxNS45JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MtMC41LDAuMS0wLjksMC4yLTEuNCwwLjNjLTEsMC4yLTIsMC40LTMuMSwwLjZjMC0wLjEsMC0wLjMsMC0wLjRjMC00LjgtMC41LTEwLjEtMS42LTE1LjVjLTAuOS00LjctMi4yLTkuMS0zLjctMTMuMSYj'+
			'eGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLTMuMi0wLjMtNi41LTAuNS0xMC0wLjVsLTAuOS00LjVjMC4zLDAsMC42LDAsMC45LDBjMi43LDAsNS40LDAuMSw4LDAuM2MtMi4xLTQuNC00LjQtOC4xLTYuOC0xMC42Yy0xLjctMS44LTMuNC0zLTQuOC0zLjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0wLjctMC4zLTEuMy0wLjQtMS45LTAuNWw2LjksMzQuOWwyLjksMTQuN2MtMC45LDAtMS44LDAuMS0yLjcsMC4xbC0yLjgtMTQuMmwtNi45LTM0LjljLTAuNiwwLjMtMS4yLDAuNy0xLjgsMS40JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MtMSwxLTEuOSwyLjYtMi43LDQuNWMtMS42LDMuOS0yLj'+
			'UsOS41LTIuNSwxNS45YzAsNC44LDAuNSwxMC4xLDEuNiwxNS41bDAsMGMwLjksNC43LDIuMiw5LjEsMy43LDEzLjFjMy4yLDAuMyw2LjUsMC41LDEwLDAuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjNy43LDAsMTQuOS0wLjksMjEuMS0yLjRjNi4yLTEuNSwxMS4zLTMuNywxNC44LTYuMWMyLjMtMS42LDMuOS0zLjQsNC43LTVjMC40LTAuOSwwLjctMS44LDAuNy0yLjhjMC0wLjktMC4yLTEuOC0wLjctMi44JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0MxMDUuMSw2MS4zLDEwNC40LDYwLjMsMTAzLjUsNTkuNHogTTUxLjYsNDkuNmMwLjEtMS42LDAuMi0zLjEsMC40LTQuNmMxLjktMC4yLDMu'+
			'OC0wLjQsNS44LTAuNmwwLjksNC41JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0M1Ni4yLDQ5LjEsNTMuOCw0OS4zLDUxLjYsNDkuNnoiLz4KICAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTY1LDguOUMzNCw4LjksOC45LDM0LDguOSw2NWMwLDMxLDI1LjEsNTYuMSw1Ni4xLDU2LjFjMzEsMCw1Ni4xLTI1LjEsNTYuMS01Ni4xQzEyMS4xLDM0LDk2LDguOSw2NSw4Ljl6IE0xMDYuNyw3My44JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MtMi41LDIuNS01LjksNC42LTEwLDYuNGMtOC4yLDMuNS0xOS40LDUuNi0zMS42LDUuNmMtMi43LDAtNS40LTAuMS04LTAuM2MyLjEsNC40LDQuNCw4LjEsNi'+
			'44LDEwLjZjMS43LDEuOCwzLjQsMyw0LjgsMy42JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MwLjcsMC4zLDEuNCwwLjQsMiwwLjVsLTIuNS0xMi42YzAuOSwwLDEuOC0wLjEsMi43LTAuMWwyLjQsMTIuMmMwLjYtMC4zLDEuMi0wLjcsMS44LTEuM2MxLTEsMS45LTIuNiwyLjctNC41JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MwLjgtMiwxLjQtNC40LDEuOS03LjJjMS0wLjEsMi0wLjMsMy0wLjVjMC42LTAuMSwxLjEtMC4yLDEuNi0wLjNjLTAuMywyLjEtMC42LDQuMS0xLjEsNS45Yy0xLjEsNC0yLjYsNy4zLTQuOSw5LjcmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0xLjUsMS42LTMuNCwy'+
			'LjctNS41LDMuMWwwLDBjLTAuNiwwLjEtMS4yLDAuMi0xLjgsMC4yYy0xLjQsMC0yLjgtMC4zLTQuMS0wLjhjLTEuMy0wLjUtMi42LTEuMy0zLjgtMi4zJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MtMi40LTEuOS00LjctNC41LTYuNy03LjhjLTEuNy0yLjYtMy4yLTUuNi00LjYtOC45Yy0zLjItMC40LTYuMi0xLTktMS43Yy02LjYtMS42LTEyLjItMy45LTE2LjMtNi44Yy0yLjgtMS45LTQuOS00LjItNi4yLTYuNyYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLTAuNy0xLjUtMS4xLTMuMS0xLjEtNC43YzAtMS42LDAuNC0zLjIsMS4xLTQuN2MwLjctMS41LDEuNy0yLjgsMy00LjFjMi41LTIuNS'+
			'w1LjktNC42LDEwLTYuNGMzLjEtMS4zLDYuNS0yLjQsMTAuMy0zLjMmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0wLjEsMS41LTAuMiwzLjEtMC4yLDQuN2MtNiwxLjUtMTEsMy42LTE0LjQsNmMtMi4zLDEuNi0zLjksMy40LTQuNyw1Yy0wLjQsMC45LTAuNywxLjgtMC43LDIuOGgwYzAsMC45LDAuMiwxLjgsMC43LDIuOCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC41LDAuOSwxLjEsMS45LDIuMSwyLjljMS45LDEuOSw0LjksMy44LDguNiw1LjRjNC4xLDEuOCw5LjIsMy4yLDE0LjksNC4xYy0xLjItMy42LTIuMy03LjUtMy4xLTExLjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0xLjEt'+
			'NS43LTEuNy0xMS4zLTEuNy0xNi40YzAtNS4xLDAuNS05LjgsMS42LTEzLjhjMS4xLTQsMi42LTcuMyw0LjktOS43YzEuNS0xLjYsMy40LTIuNyw1LjUtMy4xdjBjMC42LTAuMSwxLjItMC4yLDEuOC0wLjImI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzEuNCwwLDIuOCwwLjMsNC4xLDAuOGMxLjMsMC41LDIuNiwxLjMsMy44LDIuM2MyLjQsMS45LDQuNyw0LjUsNi43LDcuOGMxLjcsMi42LDMuMiw1LjYsNC42LDguOWMzLjIsMC40LDYuMiwxLDksMS43JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2M2LjYsMS42LDEyLjIsMy45LDE2LjMsNi44YzIuOCwxLjksNC45LDQuMiw2LjEsNi43YzAuNywxLj'+
			'UsMS4xLDMuMSwxLjEsNC43YzAsMS42LTAuNCwzLjItMS4xLDQuNyYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtDMTA4LjksNzEuMiwxMDcuOSw3Mi42LDEwNi43LDczLjh6Ii8+CiAgPC9nPgogIDxnPgogICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNNTIsNDVjLTAuMiwxLjQtMC4zLDMtMC40LDQuNmMyLjMtMC4zLDQuNi0wLjYsNy0wLjdsLTAuOS00LjVDNTUuOCw0NC42LDUzLjgsNDQuOCw1Miw0NXoiLz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTEwOS42LDYwLjNjLTEuMi0yLjYtMy40LTQuOC02LjEtNi43Yy00LjEtMi45LTkuNy01LjItMTYuMy02LjhjLTIuOC0wLjctNS45LTEu'+
			'Mi05LTEuNyYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLTEuNC0zLjMtMi45LTYuMy00LjYtOC45Yy0yLjEtMy4yLTQuMy01LjktNi43LTcuOGMtMS4yLTEtMi41LTEuNy0zLjgtMi4zYy0xLjMtMC41LTIuNy0wLjgtNC4xLTAuOGMtMC42LDAtMS4yLDAuMS0xLjgsMC4ydjAmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0yLjEsMC40LTQsMS42LTUuNSwzLjFjLTIuMywyLjQtMy44LDUuNy00LjksOS43Yy0xLjEsNC0xLjYsOC43LTEuNiwxMy44YzAsNS4xLDAuNSwxMC43LDEuNywxNi40YzAuOCw0LjEsMS45LDgsMy4xLDExLjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy01LjctMC45LTEwLj'+
			'gtMi4zLTE0LjktNC4xYy0zLjctMS42LTYuNy0zLjUtOC42LTUuNGMtMS0xLTEuNy0xLjktMi4xLTIuOWMtMC40LTAuOS0wLjctMS44LTAuNy0yLjhoMGMwLTAuOSwwLjItMS44LDAuNy0yLjgmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzAuOC0xLjYsMi4zLTMuNCw0LjctNWMzLjQtMi40LDguNC00LjUsMTQuNC02YzAtMS42LDAuMS0zLjIsMC4yLTQuN2MtMy44LDAuOS03LjIsMi0xMC4zLDMuM2MtNC4xLDEuOC03LjUsMy45LTEwLDYuNCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLTEuMiwxLjMtMi4zLDIuNi0zLDQuMWMtMC43LDEuNS0xLjEsMy4xLTEuMSw0LjdjMCwxLjYsMC40LDMuMiwx'+
			'LjEsNC43YzEuMiwyLjYsMy40LDQuOCw2LjIsNi43YzQuMSwyLjksOS43LDUuMiwxNi4zLDYuOCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMi44LDAuNyw1LjksMS4zLDksMS43YzEuNCwzLjMsMi45LDYuMyw0LjYsOC45YzIuMSwzLjIsNC4zLDUuOSw2LjcsNy44YzEuMiwxLDIuNSwxLjcsMy44LDIuM2MxLjMsMC41LDIuNywwLjgsNC4xLDAuOCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC42LDAsMS4yLTAuMSwxLjgtMC4ybDAsMGMyLjEtMC40LDQtMS42LDUuNS0zLjFjMi4zLTIuNCwzLjgtNS43LDQuOS05LjdjMC41LTEuOCwwLjktMy44LDEuMS01LjljLTAuNSwwLjEtMS4xLDAuMi0xLj'+
			'YsMC4zJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MtMSwwLjItMiwwLjMtMywwLjVjLTAuNCwyLjctMS4xLDUuMi0xLjksNy4yYy0wLjgsMi0xLjcsMy41LTIuNyw0LjVjLTAuNiwwLjYtMS4yLDEtMS44LDEuM2wtMi40LTEyLjJjLTAuOSwwLTEuOCwwLjEtMi43LDAuMSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtsMi41LDEyLjZjLTAuNiwwLTEuMy0wLjItMi0wLjVjLTEuNS0wLjYtMy4yLTEuOC00LjgtMy42Yy0yLjQtMi41LTQuNy02LjEtNi44LTEwLjZjMi42LDAuMiw1LjMsMC4zLDgsMC4zJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MxMi4zLDAsMjMuNC0yLjEsMzEuNi01LjZjNC4xLTEu'+
			'OCw3LjUtMy45LDEwLTYuNGMxLjItMS4zLDIuMy0yLjYsMy00LjFjMC43LTEuNSwxLjEtMy4xLDEuMS00LjcmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7QzExMC44LDYzLjQsMTEwLjQsNjEuOCwxMDkuNiw2MC4zeiBNMTA1LjYsNjcuOGMtMC44LDEuNi0yLjMsMy40LTQuNyw1Yy0zLjUsMi41LTguNiw0LjYtMTQuOCw2LjFjLTYuMiwxLjUtMTMuNCwyLjQtMjEuMSwyLjQmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0zLjQsMC02LjgtMC4yLTEwLTAuNWMtMS41LTQtMi44LTguNC0zLjctMTMuMWwwLDBjLTEuMS01LjUtMS42LTEwLjctMS42LTE1LjVjMC02LjQsMC45LTEyLDIuNS0xNS45YzAuOC'+
			'0yLDEuNy0zLjUsMi43LTQuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC42LTAuNiwxLjItMS4xLDEuOC0xLjRsNi45LDM0LjlsMi44LDE0LjJjMC45LDAsMS44LDAsMi43LTAuMWwtMi45LTE0LjdsLTYuOS0zNC45YzAuNiwwLDEuMywwLjIsMS45LDAuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMS41LDAuNiwzLjIsMS44LDQuOCwzLjZjMi40LDIuNSw0LjcsNi4xLDYuOCwxMC42Yy0yLjYtMC4yLTUuMy0wLjMtOC0wLjNjLTAuMywwLTAuNiwwLTAuOSwwbDAuOSw0LjVjMy40LDAsNi44LDAuMiwxMCwwLjUmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzEuNSw0LDIuOCw4LjQsMy43LDEz'+
			'LjFjMS4xLDUuNSwxLjYsMTAuNywxLjYsMTUuNWMwLDAuMiwwLDAuMywwLDAuNGMxLjEtMC4yLDIuMS0wLjQsMy4xLTAuNmMwLjUtMC4xLDAuOS0wLjIsMS40LTAuMyYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC01LTAuNi0xMC40LTEuNy0xNS45Yy0wLjgtNC4xLTEuOS04LTMuMS0xMS42YzUuNywwLjksMTAuNywyLjMsMTQuOSw0LjFjMy43LDEuNiw2LjcsMy41LDguNiw1LjRjMSwxLDEuNywxLjksMi4xLDIuOSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC40LDAuOSwwLjcsMS44LDAuNywyLjhDMTA2LjIsNjUuOSwxMDYsNjYuOCwxMDUuNiw2Ny44eiIvPgogIDwvZz4KIDwvZz4KPC9zdm'+
			'c+Cg==';
		me._gyro_on__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		elo=me._gyro_on__imgo=document.createElement('img');
		elo.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEzMCAxMzA7IiB2aWV3Qm94PSIwIDAgMTMwIDEzMCIgeT0iMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgaWQ9IkxheWVyXzEiIHhtbDpzcGFjZT0icH'+
			'Jlc2VydmUiPgogPGcgaWQ9IkxheWVyXzFfMV8iLz4KIDxnIGlkPSJMYXllcl8yXzFfIj4KICA8Zz4KICAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTEwNy44LDU4LjdjLTIuMS0yLjEtNS40LTQuMi05LjYtNmMtNC42LTItMTAuMi0zLjUtMTYuNS00LjVjMS40LDQsMi41LDguMywzLjQsMTIuOGMxLjIsNi4yLDEuOCwxMi4yLDEuOSwxNy43JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MtMC41LDAuMS0xLDAuMi0xLjYsMC4zYy0xLjEsMC4yLTIuMywwLjQtMy40LDAuNmMwLTAuMiwwLTAuMywwLTAuNWMwLTUuMy0wLjYtMTEuMi0xLjgtMTcuM2MtMS01LjItMi40LTEwLjEtNC4xLTE0LjUmI3hk'+
			'OyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0zLjYtMC40LTcuMy0wLjYtMTEuMS0wLjZsLTEtNWMwLjMsMCwwLjcsMCwxLDBjMywwLDYsMC4xLDguOSwwLjRjLTIuMy00LjktNC45LTktNy41LTExLjdjLTEuOS0yLTMuNy0zLjMtNS40LTQmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0wLjgtMC4zLTEuNS0wLjUtMi4yLTAuNWw3LjcsMzguOEw2OS43LDgxYy0xLDAtMiwwLjEtMywwLjFsLTMuMS0xNS44bC03LjctMzguN2MtMC43LDAuMy0xLjMsMC44LTIsMS41Yy0xLjEsMS4yLTIuMiwyLjktMyw1JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0M0OS4xLDM3LjUsNDgsNDMuNiw0OCw1MC44YzAsNS4zLD'+
			'AuNiwxMS4yLDEuOCwxNy4ybDAsMGMxLDUuMiwyLjQsMTAuMSw0LjEsMTQuNWMzLjYsMC40LDcuMywwLjYsMTEuMSwwLjZjOC42LDAsMTYuNi0xLDIzLjUtMi43JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2M2LjktMS43LDEyLjYtNC4xLDE2LjQtNi44YzIuNi0xLjgsNC4zLTMuNyw1LjItNS42YzAuNS0xLDAuNy0yLDAuNy0zLjFjMC0xLTAuMi0yLTAuNy0zLjFDMTA5LjYsNjAuOSwxMDguOCw1OS44LDEwNy44LDU4Ljd6JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5OyBNNTAuMSw0Ny45YzAuMS0xLjgsMC4yLTMuNSwwLjQtNS4xYzIuMS0wLjMsNC4yLTAuNSw2LjQtMC42bDEsNC45QzU1LjIsNDcu'+
			'Myw1Mi42LDQ3LjYsNTAuMSw0Ny45eiIvPgogICA8cGF0aCBmaWxsPSIjMDAwMDAwIiBkPSJNNjUsMi42QzMwLjYsMi42LDIuNiwzMC42LDIuNiw2NWMwLDM0LjQsMjcuOSw2Mi40LDYyLjQsNjIuNGMzNC40LDAsNjIuNC0yNy45LDYyLjQtNjIuNEMxMjcuNCwzMC42LDk5LjQsMi42LDY1LDIuNnomI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7IE0xMTEuMyw3NC44Yy0yLjgsMi44LTYuNiw1LjEtMTEuMiw3LjFDOTEsODUuOCw3OC42LDg4LjEsNjUsODguMWMtMywwLTYtMC4xLTguOS0wLjNjMi4zLDQuOSw0LjksOSw3LjUsMTEuNyYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMS45LDIsMy43LDMuMy'+
			'w1LjQsNGMwLjgsMC4zLDEuNSwwLjUsMi4yLDAuNWwtMi44LTE0YzEsMCwyLTAuMSwzLTAuMWwyLjcsMTMuNWMwLjctMC4zLDEuMy0wLjgsMi0xLjVjMS4xLTEuMiwyLjItMi45LDMtNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC45LTIuMiwxLjYtNC45LDIuMS04YzEuMS0wLjIsMi4zLTAuMywzLjMtMC41YzAuNi0wLjEsMS4yLTAuMiwxLjgtMC40Yy0wLjMsMi4zLTAuNyw0LjUtMS4yLDYuNWMtMS4yLDQuNC0yLjksOC4xLTUuNCwxMC44JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MtMS43LDEuOC0zLjcsMy02LjEsMy41bDAsMGMtMC43LDAuMS0xLjMsMC4yLTIsMC4yYy0xLjUsMC0zLjEt'+
			'MC4zLTQuNS0wLjljLTEuNS0wLjYtMi45LTEuNC00LjItMi41Yy0yLjctMi4xLTUuMi01LTcuNS04LjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0xLjgtMi45LTMuNi02LjItNS4xLTkuOWMtMy41LTAuNS02LjktMS4xLTEwLTEuOUMzMyw4My41LDI2LjgsODEsMjIuMiw3Ny43Yy0zLjEtMi4yLTUuNC00LjYtNi44LTcuNWMtMC44LTEuNi0xLjItMy40LTEuMi01LjImI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzAtMS44LDAuNC0zLjYsMS4yLTUuMmMwLjgtMS42LDEuOS0zLjIsMy4zLTQuNWMyLjgtMi44LDYuNi01LjEsMTEuMi03LjFjMy40LTEuNSw3LjMtMi43LDExLjUtMy43Yy0wLjEsMS'+
			'43LTAuMiwzLjQtMC4zLDUuMiYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLTYuNiwxLjctMTIuMiw0LTE2LDYuN2MtMi42LDEuOC00LjMsMy43LTUuMiw1LjZjLTAuNSwxLTAuNywyLTAuNywzLjFoMGMwLDEsMC4yLDIsMC43LDMuMWMwLjUsMSwxLjMsMi4xLDIuMywzLjImI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzIuMSwyLjEsNS40LDQuMiw5LjYsNmM0LjYsMiwxMC4yLDMuNSwxNi41LDQuNWMtMS40LTQtMi41LTguMy0zLjQtMTIuOEM0My42LDYyLjYsNDMsNTYuNCw0Myw1MC44YzAtNS43LDAuNi0xMC45LDEuOC0xNS4zJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MxLjItNC40LDIuOS04'+
			'LjEsNS40LTEwLjhjMS43LTEuOCwzLjctMyw2LjEtMy41djBjMC43LTAuMSwxLjMtMC4yLDItMC4yYzEuNSwwLDMuMSwwLjMsNC41LDAuOWMxLjUsMC42LDIuOSwxLjQsNC4yLDIuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMi43LDIuMSw1LjIsNSw3LjUsOC42YzEuOCwyLjksMy42LDYuMiw1LjEsOS45YzMuNSwwLjUsNi45LDEuMSwxMCwxLjljNy4zLDEuOCwxMy41LDQuNCwxOC4xLDcuNmMzLjEsMi4yLDUuNCw0LjYsNi44LDcuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC44LDEuNiwxLjIsMy40LDEuMiw1LjJjMCwxLjgtMC40LDMuNi0xLjIsNS4yQzExMy44LDcxLjksMTEyLjcsNz'+
			'MuNCwxMTEuMyw3NC44eiIvPgogIDwvZz4KICA8Zz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTUwLjUsNDIuOGMtMC4yLDEuNi0wLjQsMy4zLTAuNCw1LjFjMi41LTAuNCw1LjEtMC42LDcuOC0wLjhsLTEtNC45QzU0LjcsNDIuMyw1Mi42LDQyLjUsNTAuNSw0Mi44eiIvPgogICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTE0LjYsNTkuOGMtMS40LTIuOS0zLjgtNS4zLTYuOC03LjVjLTQuNi0zLjItMTAuOC01LjgtMTguMS03LjZjLTMuMS0wLjgtNi41LTEuNC0xMC0xLjkmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0xLjUtMy43LTMuMy03LTUuMS05LjljLTIuMy0zLjYtNC44LTYu'+
			'NS03LjUtOC42Yy0xLjMtMS4xLTIuNy0xLjktNC4yLTIuNWMtMS41LTAuNi0zLTAuOS00LjUtMC45Yy0wLjcsMC0xLjQsMC4xLTIsMC4ydjAmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0yLjQsMC41LTQuNCwxLjctNi4xLDMuNWMtMi41LDIuNy00LjIsNi40LTUuNCwxMC44Yy0xLjIsNC40LTEuOCw5LjYtMS44LDE1LjNjMCw1LjcsMC42LDExLjgsMS45LDE4LjImI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzAuOSw0LjUsMi4xLDguOCwzLjQsMTIuOGMtNi4zLTEtMTEuOS0yLjYtMTYuNS00LjVjLTQuMi0xLjgtNy40LTMuOS05LjYtNmMtMS4xLTEuMS0xLjgtMi4xLTIuMy0zLjJjLTAuNS0xLT'+
			'AuNy0yLTAuNy0zLjFoMCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC0xLDAuMi0yLDAuNy0zLjFjMC45LTEuOCwyLjYtMy44LDUuMi01LjZjMy44LTIuNyw5LjMtNSwxNS45LTYuN2MwLTEuOCwwLjEtMy41LDAuMy01LjJjLTQuMiwxLTgsMi4yLTExLjUsMy43JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MtNC42LDItOC40LDQuMy0xMS4yLDcuMWMtMS40LDEuNC0yLjUsMi45LTMuMyw0LjVjLTAuOCwxLjYtMS4yLDMuNC0xLjIsNS4yYzAsMS44LDAuNCwzLjYsMS4yLDUuMmMxLjQsMi45LDMuOCw1LjMsNi44LDcuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjNC42LDMuMiwxMC44LDUuOCwx'+
			'OC4xLDcuNmMzLjEsMC44LDYuNSwxLjQsMTAsMS45YzEuNSwzLjcsMy4zLDcsNS4xLDkuOWMyLjMsMy42LDQuOCw2LjUsNy41LDguNmMxLjMsMS4xLDIuNywxLjksNC4yLDIuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMS41LDAuNiwzLDAuOSw0LjUsMC45YzAuNywwLDEuMy0wLjEsMi0wLjJsMCwwYzIuNC0wLjUsNC40LTEuNyw2LjEtMy41YzIuNS0yLjcsNC4yLTYuNCw1LjQtMTAuOGMwLjUtMiwwLjktNC4yLDEuMi02LjUmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0wLjYsMC4xLTEuMiwwLjMtMS44LDAuNGMtMS4xLDAuMi0yLjIsMC40LTMuMywwLjVjLTAuNSwzLTEuMiw1LjctMi4xLD'+
			'hjLTAuOSwyLjItMS45LDMuOS0zLDVjLTAuNiwwLjctMS4zLDEuMi0yLDEuNWwtMi43LTEzLjUmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0xLDAuMS0yLDAuMS0zLDAuMWwyLjgsMTRjLTAuNy0wLjEtMS40LTAuMi0yLjItMC41Yy0xLjctMC43LTMuNS0yLTUuNC00Yy0yLjYtMi44LTUuMi02LjgtNy41LTExLjdDNTksODgsNjIsODguMSw2NSw4OC4xJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MxMy42LDAsMjYtMi4zLDM1LjItNi4yYzQuNi0yLDguNC00LjMsMTEuMi03LjFjMS40LTEuNCwyLjUtMi45LDMuMy00LjVjMC44LTEuNiwxLjItMy40LDEuMi01LjImI3hkOyYjeGE7JiN4OTsmI3g5'+
			'OyYjeDk7QzExNS44LDYzLjIsMTE1LjQsNjEuNCwxMTQuNiw1OS44eiBNMTEwLjEsNjguMWMtMC45LDEuOC0yLjYsMy44LTUuMiw1LjZjLTMuOSwyLjctOS42LDUuMS0xNi40LDYuOGMtNi45LDEuNy0xNC45LDIuNy0yMy41LDIuNyYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLTMuOCwwLTcuNS0wLjItMTEuMS0wLjZjLTEuNy00LjQtMy4xLTkuMy00LjEtMTQuNWwwLDBDNDguNiw2MS45LDQ4LDU2LjEsNDgsNTAuOGMwLTcuMSwxLTEzLjMsMi44LTE3LjdjMC45LTIuMiwxLjktMy45LDMtNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC43LTAuNywxLjMtMS4yLDItMS41bDcuNywzOC43bDMuMS'+
			'wxNS44YzEsMCwyLDAsMy0wLjFsLTMuMi0xNi4zTDU4LjgsMjZjMC43LDAuMSwxLjQsMC4yLDIuMiwwLjVjMS42LDAuNywzLjUsMiw1LjQsNCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMi42LDIuOCw1LjIsNi44LDcuNSwxMS43QzcxLDQyLDY4LDQxLjksNjUsNDEuOWMtMC4zLDAtMC43LDAtMSwwbDEsNWMzLjgsMCw3LjUsMC4yLDExLjEsMC42YzEuNyw0LjQsMy4xLDkuMyw0LjEsMTQuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMS4yLDYuMSwxLjgsMTEuOSwxLjgsMTcuM2MwLDAuMiwwLDAuMywwLDAuNWMxLjItMC4yLDIuMy0wLjQsMy40LTAuNmMwLjUtMC4xLDEtMC4yLDEuNi0wLjNj'+
			'MC01LjUtMC42LTExLjUtMS45LTE3LjcmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0wLjktNC41LTIuMS04LjgtMy40LTEyLjhjNi4zLDEsMTEuOSwyLjYsMTYuNSw0LjVjNC4yLDEuOCw3LjQsMy45LDkuNiw2YzEuMSwxLjEsMS44LDIuMSwyLjMsMy4yYzAuNSwxLDAuNywyLDAuNywzLjEmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7QzExMC44LDY2LDExMC42LDY3LDExMC4xLDY4LjF6Ii8+CiAgPC9nPgogPC9nPgo8L3N2Zz4K';
		me._gyro_on__imgo.setAttribute('src',hs);
		elo.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;visibility:hidden;pointer-events:none;;');
		elo['ondragstart']=function() { return false; };
		el.appendChild(elo);
		el.ggId="gyro_on";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 0px;';
		hs+='opacity : 0;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : hidden;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._gyro_on.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._gyro_on.logicBlock_alpha = function() {
			var newLogicStateAlpha;
			if (
				((player.getUseGyro() == false))
			)
			{
				newLogicStateAlpha = 0;
			}
			else {
				newLogicStateAlpha = -1;
			}
			if (me._gyro_on.ggCurrentLogicStateAlpha != newLogicStateAlpha) {
				me._gyro_on.ggCurrentLogicStateAlpha = newLogicStateAlpha;
				me._gyro_on.style[domTransition]='opacity 0s';
				if (me._gyro_on.ggCurrentLogicStateAlpha == 0) {
					me._gyro_on.style.visibility=me._gyro_on.ggVisible?'inherit':'hidden';
					me._gyro_on.style.opacity=1;
				}
				else {
					me._gyro_on.style.visibility="hidden";
					me._gyro_on.style.opacity=0;
				}
			}
		}
		me._gyro_on.onmouseover=function (e) {
			me._gyro_on__img.style.visibility='hidden';
			me._gyro_on__imgo.style.visibility='inherit';
		}
		me._gyro_on.onmouseout=function (e) {
			me._gyro_on__img.style.visibility='inherit';
			me._gyro_on__imgo.style.visibility='hidden';
		}
		me._gyro_on.ggUpdatePosition=function (useTransition) {
		}
		me._gyro.appendChild(me._gyro_on);
		el=me._gyro_off=document.createElement('div');
		els=me._gyro_off__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEzMCAxMzA7IiB2aWV3Qm94PSIwIDAgMTMwIDEzMCIgeT0iMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgaWQ9IkxheWVyXzEiIHhtbDpzcGFjZT0icH'+
			'Jlc2VydmUiPgogPGcgaWQ9IkxheWVyXzFfMV8iLz4KIDxnIGlkPSJMYXllcl8yXzFfIj4KICA8cGF0aCBmaWxsPSIjMDAwMDAwIiBkPSJNNjUsOC45QzM0LDguOSw4LjksMzQsOC45LDY1YzAsMzEsMjUuMSw1Ni4xLDU2LjEsNTYuMWMzMSwwLDU2LjEtMjUuMSw1Ni4xLTU2LjFDMTIxLjEsMzQsOTYsOC45LDY1LDguOXogTTQ2LjgsMzguNCYjeGQ7JiN4YTsmI3g5OyYjeDk7YzEuMS00LDIuNi03LjMsNC45LTkuN2MxLjUtMS42LDMuNC0yLjcsNS41LTMuMXYwYzAuNi0wLjEsMS4yLTAuMiwxLjgtMC4yYzEuNCwwLDIuOCwwLjMsNC4xLDAuOGMxLjMsMC41LDIuNiwxLjMsMy44LDIuMyYjeGQ7JiN4'+
			'YTsmI3g5OyYjeDk7YzIuNCwxLjksNC43LDQuNSw2LjcsNy44YzEuNywyLjYsMy4yLDUuNiw0LjYsOC45YzAuMSwwLDAuMiwwLDAuMywwLjFsLTQuMSw0LjFjLTMtMC4zLTYuMi0wLjUtOS41LTAuNWwtMC45LTQuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7YzAuMywwLDAuNiwwLDAuOSwwYzIuNywwLDUuNCwwLjEsOCwwLjNjLTIuMS00LjQtNC40LTguMS02LjgtMTAuNmMtMS43LTEuOC0zLjQtMy00LjgtMy42Yy0wLjctMC4zLTEuMy0wLjQtMS45LTAuNWw1LjcsMjguNyYjeGQ7JiN4YTsmI3g5OyYjeDk7bC0yLjMsMi4zbC02LTMwLjRjLTAuNiwwLjMtMS4yLDAuNy0xLjgsMS40Yy0xLDEtMS45LDIuNi'+
			'0yLjcsNC41Yy0xLjYsMy45LTIuNSw5LjUtMi41LDE1LjljMCw0LjgsMC41LDEwLjEsMS42LDE1LjVsMCwwJiN4ZDsmI3hhOyYjeDk7JiN4OTtjMC4zLDEuMywwLjUsMi41LDAuOCwzLjhsLTMuNywzLjdjLTAuNi0yLjEtMS4xLTQuMy0xLjYtNi42Yy0xLjEtNS43LTEuNy0xMS4zLTEuNy0xNi40QzQ1LjIsNDcsNDUuOCw0Mi40LDQ2LjgsMzguNHogTTU4LjYsNDguOSYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0yLjQsMC4yLTQuOCwwLjQtNywwLjdjMC4xLTEuNiwwLjItMy4xLDAuNC00LjZjMS45LTAuMiwzLjgtMC40LDUuOC0wLjZMNTguNiw0OC45eiBNMjAuNCw2OS43Yy0wLjctMS41LTEuMS0zLjEt'+
			'MS4xLTQuNyYjeGQ7JiN4YTsmI3g5OyYjeDk7YzAtMS42LDAuNC0zLjIsMS4xLTQuN2MwLjctMS41LDEuNy0yLjgsMy00LjFjMi41LTIuNSw1LjktNC42LDEwLTYuNGMzLjEtMS4zLDYuNS0yLjQsMTAuMy0zLjNjLTAuMSwxLjUtMC4yLDMuMS0wLjIsNC43JiN4ZDsmI3hhOyYjeDk7JiN4OTtjLTYsMS41LTExLDMuNi0xNC40LDZjLTIuMywxLjYtMy45LDMuNC00LjcsNWMtMC40LDAuOS0wLjcsMS44LTAuNywyLjhoMGMwLDAuOSwwLjIsMS44LDAuNywyLjhjMC41LDAuOSwxLjEsMS45LDIuMSwyLjkmI3hkOyYjeGE7JiN4OTsmI3g5O2MxLjksMS45LDQuOSwzLjgsOC42LDUuNGMyLjgsMS4yLDUuOS'+
			'wyLjIsOS40LDNsLTMuNywzLjdjLTUuNy0xLjYtMTAuNi0zLjctMTQuNC02LjNDMjMuOCw3NC41LDIxLjYsNzIuMywyMC40LDY5Ljd6IE0zMi44LDEwMC4zJiN4ZDsmI3hhOyYjeDk7JiN4OTtjLTAuNCwwLTAuOC0wLjEtMS4xLTAuNGwtMS43LTEuN2MtMC42LTAuNi0wLjYtMS42LDAtMi4ybDY2LTY2YzAuMy0wLjMsMC43LTAuNCwxLjEtMC40czAuOCwwLjEsMS4xLDAuNGwxLjcsMS43JiN4ZDsmI3hhOyYjeDk7JiN4OTtjMC42LDAuNiwwLjYsMS42LDAsMi4ybC02Niw2NkMzMy42LDEwMC4yLDMzLjIsMTAwLjMsMzIuOCwxMDAuM3ogTTc4LjcsNjIuM2MtMC4zLTEuMy0wLjUtMi41LTAuOC0zLjhs'+
			'My43LTMuNyYjeGQ7JiN4YTsmI3g5OyYjeDk7YzAuNiwyLjEsMS4xLDQuMywxLjYsNi42YzEuMSw1LjYsMS42LDExLDEuNywxNS45Yy0wLjUsMC4xLTAuOSwwLjItMS40LDAuM2MtMSwwLjItMiwwLjQtMy4xLDAuNmMwLTAuMSwwLTAuMywwLTAuNCYjeGQ7JiN4YTsmI3g5OyYjeDk7QzgwLjMsNzMsNzkuOCw2Ny44LDc4LjcsNjIuM3ogTTY5LjMsNzkuNGMtMC45LDAtMS44LDAuMS0yLjcsMC4xbC0xLjYtOC4xbDIuMy0yLjNMNjkuMyw3OS40eiBNMTA2LjcsNzMuOCYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0yLjUsMi41LTUuOSw0LjYtMTAsNi40Yy04LjIsMy41LTE5LjQsNS42LTMxLjYsNS42Yy0yLj'+
			'csMC01LjQtMC4xLTgtMC4zYzIuMSw0LjQsNC40LDguMSw2LjgsMTAuNmMxLjcsMS44LDMuNCwzLDQuOCwzLjYmI3hkOyYjeGE7JiN4OTsmI3g5O2MwLjcsMC4zLDEuNCwwLjQsMiwwLjVsLTIuNS0xMi42YzAuOSwwLDEuOC0wLjEsMi43LTAuMWwyLjQsMTIuMmMwLjYtMC4zLDEuMi0wLjcsMS44LTEuM2MxLTEsMS45LTIuNiwyLjctNC41JiN4ZDsmI3hhOyYjeDk7JiN4OTtjMC44LTIsMS40LTQuNCwxLjktNy4yYzEtMC4xLDItMC4zLDMtMC41YzAuNi0wLjEsMS4xLTAuMiwxLjYtMC4zYy0wLjMsMi4xLTAuNiw0LjEtMS4xLDUuOWMtMS4xLDQtMi42LDcuMy00LjksOS43JiN4ZDsmI3hhOyYjeDk7'+
			'JiN4OTtjLTEuNSwxLjYtMy40LDIuNy01LjUsMy4xbDAsMGMtMC42LDAuMS0xLjIsMC4yLTEuOCwwLjJjLTEuNCwwLTIuOC0wLjMtNC4xLTAuOGMtMS4zLTAuNS0yLjYtMS4zLTMuOC0yLjMmI3hkOyYjeGE7JiN4OTsmI3g5O2MtMi40LTEuOS00LjctNC41LTYuNy03LjhjLTEuNy0yLjYtMy4yLTUuNi00LjYtOC45Yy0wLjEsMC0wLjIsMC0wLjQtMC4xbDQuMS00LjFjMywwLjMsNi4yLDAuNSw5LjUsMC41YzcuNywwLDE0LjktMC45LDIxLjEtMi40JiN4ZDsmI3hhOyYjeDk7JiN4OTtjNi4yLTEuNSwxMS4zLTMuNywxNC44LTYuMWMyLjMtMS42LDMuOS0zLjQsNC43LTVjMC40LTAuOSwwLjctMS44LD'+
			'AuNy0yLjhjMC0wLjktMC4yLTEuOC0wLjctMi44Yy0wLjQtMC45LTEuMS0xLjktMi4xLTIuOSYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0xLjktMS45LTQuOS0zLjgtOC42LTUuNGMtMi44LTEuMi02LTIuMi05LjUtM2wzLjctMy43YzUuNywxLjYsMTAuNiwzLjcsMTQuNCw2LjNjMi44LDEuOSw0LjksNC4yLDYuMSw2LjcmI3hkOyYjeGE7JiN4OTsmI3g5O2MwLjcsMS41LDEuMSwzLjEsMS4xLDQuN2MwLDEuNi0wLjQsMy4yLTEuMSw0LjdDMTA4LjksNzEuMiwxMDcuOSw3Mi42LDEwNi43LDczLjh6Ii8+CiAgPGc+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik01MS42LDQ5LjZjMi4zLTAuMyw0LjYt'+
			'MC42LDctMC43bC0wLjktNC41Yy0yLDAuMS0zLjksMC4zLTUuOCwwLjZDNTEuOCw0Ni41LDUxLjcsNDgsNTEuNiw0OS42eiIvPgogICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNOTkuOSwzMS44bC0xLjctMS43Yy0wLjMtMC4zLTAuNy0wLjQtMS4xLTAuNHMtMC44LDAuMS0xLjEsMC40bC02Niw2NmMtMC42LDAuNi0wLjYsMS42LDAsMi4ybDEuNywxLjcmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzAuMywwLjMsMC43LDAuNCwxLjEsMC40YzAuNCwwLDAuOC0wLjEsMS4xLTAuNGw2Ni02NkMxMDAuNSwzMy4zLDEwMC41LDMyLjQsOTkuOSwzMS44eiIvPgogICA8cGF0aCBmaWxsPSIjRkZGRkZGIi'+
			'BkPSJNNjYuNSw3OS41YzAuOSwwLDEuOCwwLDIuNy0wLjFsLTItMTAuM2wtMi4zLDIuM0w2Ni41LDc5LjV6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik04My40LDc3LjdjMC41LTAuMSwwLjktMC4yLDEuNC0wLjNjMC01LTAuNi0xMC40LTEuNy0xNS45Yy0wLjQtMi4zLTEtNC41LTEuNi02LjZsLTMuNywzLjcmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzAuMywxLjIsMC42LDIuNSwwLjgsMy44YzEuMSw1LjUsMS42LDEwLjcsMS42LDE1LjVjMCwwLjIsMCwwLjMsMCwwLjRDODEuMyw3OC4xLDgyLjQsNzcuOSw4My40LDc3Ljd6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik00'+
			'OC41LDc1LjJsMy43LTMuN2MtMC4zLTEuMi0wLjYtMi41LTAuOC0zLjhsMCwwYy0xLjEtNS41LTEuNi0xMC43LTEuNi0xNS41YzAtNi40LDAuOS0xMiwyLjUtMTUuOSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC44LTIsMS43LTMuNSwyLjctNC41YzAuNi0wLjYsMS4yLTEuMSwxLjgtMS40bDYsMzAuNGwyLjMtMi4zbC01LjctMjguN2MwLjYsMCwxLjMsMC4yLDEuOSwwLjVjMS41LDAuNiwzLjIsMS44LDQuOCwzLjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzIuNCwyLjUsNC43LDYuMSw2LjgsMTAuNmMtMi42LTAuMi01LjMtMC4zLTgtMC4zYy0wLjMsMC0wLjYsMC0wLjksMGwwLjksNC41Yz'+
			'MuMywwLDYuNCwwLjIsOS41LDAuNWw0LjEtNC4xJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MtMC4xLDAtMC4yLDAtMC4zLTAuMWMtMS40LTMuMy0yLjktNi4zLTQuNi04LjljLTIuMS0zLjItNC4zLTUuOS02LjctNy44Yy0xLjItMS0yLjUtMS43LTMuOC0yLjNjLTEuMy0wLjUtMi43LTAuOC00LjEtMC44JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MtMC42LDAtMS4yLDAuMS0xLjgsMC4ydjBjLTIuMSwwLjQtNCwxLjYtNS41LDMuMWMtMi4zLDIuNC0zLjgsNS43LTQuOSw5LjdjLTEuMSw0LTEuNiw4LjctMS42LDEzLjhjMCw1LjEsMC41LDEwLjcsMS43LDE2LjQmI3hkOyYjeGE7JiN4OTsmI3g5'+
			'OyYjeDk7QzQ3LjQsNzAuOCw0Ny45LDczLDQ4LjUsNzUuMnoiLz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTQ0LjYsNzkuMWMtMy41LTAuOC02LjctMS44LTkuNC0zYy0zLjctMS42LTYuNy0zLjUtOC42LTUuNGMtMS0xLTEuNy0xLjktMi4xLTIuOWMtMC40LTAuOS0wLjctMS44LTAuNy0yLjgmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7aDBjMC0wLjksMC4yLTEuOCwwLjctMi44YzAuOC0xLjYsMi4zLTMuNCw0LjctNWMzLjQtMi40LDguNC00LjUsMTQuNC02YzAtMS42LDAuMS0zLjIsMC4yLTQuN2MtMy44LDAuOS03LjIsMi0xMC4zLDMuMyYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLT'+
			'QuMSwxLjgtNy41LDMuOS0xMCw2LjRjLTEuMiwxLjMtMi4zLDIuNi0zLDQuMWMtMC43LDEuNS0xLjEsMy4xLTEuMSw0LjdjMCwxLjYsMC40LDMuMiwxLjEsNC43YzEuMiwyLjYsMy40LDQuOCw2LjIsNi43JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MzLjcsMi42LDguNiw0LjcsMTQuNCw2LjNMNDQuNiw3OS4xeiIvPgogICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTA5LjcsNjAuM2MtMS4yLTIuNi0zLjQtNC44LTYuMS02LjdjLTMuNy0yLjYtOC42LTQuNy0xNC40LTYuM2wtMy43LDMuN2MzLjUsMC44LDYuNywxLjgsOS41LDMmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzMuNywxLjYsNi43'+
			'LDMuNSw4LjYsNS40YzEsMSwxLjcsMS45LDIuMSwyLjljMC40LDAuOSwwLjcsMS44LDAuNywyLjhjMCwwLjktMC4yLDEuOC0wLjcsMi44Yy0wLjgsMS42LTIuMywzLjQtNC43LDUmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0zLjUsMi41LTguNiw0LjYtMTQuOCw2LjFjLTYuMiwxLjUtMTMuNCwyLjQtMjEuMSwyLjRjLTMuMywwLTYuNC0wLjItOS41LTAuNWwtNC4xLDQuMWMwLjEsMCwwLjIsMCwwLjQsMC4xJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MxLjQsMy4zLDIuOSw2LjMsNC42LDguOWMyLjEsMy4yLDQuMyw1LjksNi43LDcuOGMxLjIsMSwyLjUsMS43LDMuOCwyLjNjMS4zLDAuNSwyLj'+
			'csMC44LDQuMSwwLjhjMC42LDAsMS4yLTAuMSwxLjgtMC4ybDAsMCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMi4xLTAuNCw0LTEuNiw1LjUtMy4xYzIuMy0yLjQsMy44LTUuNyw0LjktOS43YzAuNS0xLjgsMC45LTMuOCwxLjEtNS45Yy0wLjUsMC4xLTEuMSwwLjItMS42LDAuM2MtMSwwLjItMiwwLjMtMywwLjUmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0wLjQsMi43LTEuMSw1LjItMS45LDcuMmMtMC44LDItMS43LDMuNS0yLjcsNC41Yy0wLjYsMC42LTEuMiwxLTEuOCwxLjNsLTIuNC0xMi4yYy0wLjksMC0xLjgsMC4xLTIuNywwLjFsMi41LDEyLjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYj'+
			'eDk7Yy0wLjYsMC0xLjMtMC4yLTItMC41Yy0xLjUtMC42LTMuMi0xLjgtNC44LTMuNmMtMi40LTIuNS00LjctNi4xLTYuOC0xMC42YzIuNiwwLjIsNS4zLDAuMyw4LDAuM2MxMi4zLDAsMjMuNC0yLjEsMzEuNi01LjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzQuMS0xLjgsNy41LTMuOSwxMC02LjRjMS4yLTEuMywyLjMtMi42LDMtNC4xYzAuNy0xLjUsMS4xLTMuMSwxLjEtNC43QzExMC44LDYzLjQsMTEwLjQsNjEuOCwxMDkuNyw2MC4zeiIvPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg==';
		me._gyro_off__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		elo=me._gyro_off__imgo=document.createElement('img');
		elo.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEzMCAxMzA7IiB2aWV3Qm94PSIwIDAgMTMwIDEzMCIgeT0iMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgaWQ9IkxheWVyXzEiIHhtbDpzcGFjZT0icH'+
			'Jlc2VydmUiPgogPHN0eWxlIHR5cGU9InRleHQvY3NzIj4mI3hkOwoJLnN0MHtmaWxsOiNGRkZGRkY7fSYjeGQ7Cjwvc3R5bGU+CiA8ZyBpZD0iTGF5ZXJfMV8xXyIvPgogPGcgaWQ9IkxheWVyXzJfMV8iPgogIDxwYXRoIGZpbGw9IiMwMDAwMDAiIGQ9Ik02NSwyLjZDMzAuNiwyLjYsMi42LDMwLjYsMi42LDY1YzAsMzQuNCwyNy45LDYyLjQsNjIuNCw2Mi40YzM0LjQsMCw2Mi40LTI3LjksNjIuNC02Mi40QzEyNy40LDMwLjYsOTkuNSwyLjYsNjUsMi42eiYjeGQ7JiN4YTsmI3g5OyYjeDk7IE00NC44LDM1LjRjMS4yLTQuNCwyLjktOC4xLDUuNC0xMC44YzEuNy0xLjgsMy43LTMsNi4xLTMuNXYw'+
			'YzAuNy0wLjEsMS4zLTAuMiwyLTAuMmMxLjUsMCwzLjEsMC4zLDQuNSwwLjkmI3hkOyYjeGE7JiN4OTsmI3g5O2MxLjUsMC42LDIuOSwxLjQsNC4yLDIuNWMyLjcsMi4xLDUuMiw1LDcuNSw4LjZjMS44LDIuOSwzLjYsNi4yLDUuMSw5LjljMC4xLDAsMC4zLDAsMC40LDAuMWwtNC41LDQuNWMtMy40LTAuMy02LjktMC41LTEwLjUtMC41JiN4ZDsmI3hhOyYjeDk7JiN4OTtsLTEtNWMwLjMsMCwwLjcsMCwxLDBjMywwLDYsMC4xLDguOSwwLjRjLTIuMy00LjktNC45LTktNy41LTExLjdjLTEuOS0yLTMuNy0zLjMtNS40LTRjLTAuOC0wLjMtMS41LTAuNS0yLjItMC41bDYuMywzMS44JiN4ZDsmI3hhOy'+
			'YjeDk7JiN4OTtsLTIuNiwyLjZsLTYuNy0zMy44Yy0wLjcsMC4zLTEuMywwLjgtMiwxLjVjLTEuMSwxLjItMi4yLDIuOS0zLDVDNDkuMSwzNy41LDQ4LDQzLjYsNDgsNTAuOGMwLDUuMywwLjYsMTEuMiwxLjgsMTcuMmwwLDAmI3hkOyYjeGE7JiN4OTsmI3g5O2MwLjMsMS40LDAuNiwyLjgsMC45LDQuMmwtNC4xLDQuMWMtMC43LTIuNC0xLjItNC44LTEuNy03LjNDNDMuNiw2Mi42LDQzLDU2LjQsNDMsNTAuOEM0Myw0NS4xLDQzLjYsMzkuOSw0NC44LDM1LjR6IE01Ny45LDQ3LjEmI3hkOyYjeGE7JiN4OTsmI3g5O2MtMi43LDAuMi01LjMsMC40LTcuOCwwLjhjMC4xLTEuOCwwLjItMy41LDAuNC01'+
			'LjFjMi4xLTAuMyw0LjItMC41LDYuNC0wLjZMNTcuOSw0Ny4xeiBNMTUuNCw3MC4yYy0wLjgtMS42LTEuMi0zLjQtMS4yLTUuMiYjeGQ7JiN4YTsmI3g5OyYjeDk7YzAtMS44LDAuNC0zLjYsMS4yLTUuMmMwLjgtMS42LDEuOS0zLjIsMy4zLTQuNWMyLjgtMi44LDYuNi01LjEsMTEuMi03LjFjMy40LTEuNSw3LjMtMi43LDExLjUtMy43Yy0wLjEsMS43LTAuMiwzLjQtMC4zLDUuMiYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy02LjYsMS43LTEyLjIsNC0xNiw2LjdjLTIuNiwxLjgtNC4zLDMuNy01LjIsNS42Yy0wLjUsMS0wLjcsMi0wLjcsMy4xaDBjMCwxLDAuMiwyLDAuNywzLjFjMC41LDEsMS4zLDIuMS'+
			'wyLjMsMy4yJiN4ZDsmI3hhOyYjeDk7JiN4OTtjMi4xLDIuMSw1LjQsNC4yLDkuNiw2YzMuMSwxLjMsNi42LDIuNCwxMC41LDMuM2wtNC4xLDQuMWMtNi40LTEuOC0xMS44LTQuMS0xNi03QzE5LjIsNzUuNiwxNi44LDczLjEsMTUuNCw3MC4yeiBNMjkuMywxMDQuMyYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0wLjQsMC0wLjktMC4yLTEuMi0wLjVsLTEuOC0xLjhjLTAuNy0wLjctMC43LTEuNywwLTIuNGw3My4zLTczLjNjMC4zLTAuMywwLjgtMC41LDEuMi0wLjVzMC45LDAuMiwxLjIsMC41bDEuOCwxLjgmI3hkOyYjeGE7JiN4OTsmI3g5O2MwLjcsMC43LDAuNywxLjcsMCwyLjRsLTczLjMsNzMuM0Mz'+
			'MC4xLDEwNC4xLDI5LjcsMTA0LjMsMjkuMywxMDQuM3ogTTgwLjIsNjJjLTAuMy0xLjQtMC42LTIuOC0wLjktNC4ybDQuMS00LjEmI3hkOyYjeGE7JiN4OTsmI3g5O2MwLjcsMi40LDEuMiw0LjgsMS43LDcuM2MxLjIsNi4yLDEuOCwxMi4yLDEuOSwxNy43Yy0wLjUsMC4xLTEsMC4yLTEuNiwwLjNjLTEuMSwwLjItMi4zLDAuNC0zLjQsMC42YzAtMC4yLDAtMC4zLDAtMC41JiN4ZDsmI3hhOyYjeDk7JiN4OTtDODIsNzMuOSw4MS40LDY4LjEsODAuMiw2MnogTTY5LjcsODFjLTEsMC0yLDAuMS0zLDAuMWwtMS44LTguOWwyLjYtMi42TDY5LjcsODF6IE0xMTEuMyw3NC44Yy0yLjgsMi44LTYuNiw1Lj'+
			'EtMTEuMiw3LjEmI3hkOyYjeGE7JiN4OTsmI3g5O0M5MSw4NS44LDc4LjYsODguMSw2NSw4OC4xYy0zLDAtNi0wLjEtOC45LTAuM2MyLjMsNC45LDQuOSw5LDcuNSwxMS43YzEuOSwyLDMuNywzLjMsNS40LDRjMC44LDAuMywxLjUsMC41LDIuMiwwLjVsLTIuOC0xNCYjeGQ7JiN4YTsmI3g5OyYjeDk7YzEsMCwyLTAuMSwzLTAuMWwyLjcsMTMuNWMwLjctMC4zLDEuMy0wLjgsMi0xLjVjMS4xLTEuMiwyLjItMi45LDMtNWMwLjktMi4yLDEuNi00LjksMi4xLThjMS4xLTAuMiwyLjMtMC4zLDMuMy0wLjUmI3hkOyYjeGE7JiN4OTsmI3g5O2MwLjYtMC4xLDEuMi0wLjIsMS44LTAuNGMtMC4zLDIuMy0w'+
			'LjcsNC41LTEuMiw2LjVjLTEuMiw0LjQtMi45LDguMS01LjQsMTAuOGMtMS43LDEuOC0zLjcsMy02LjEsMy41bDAsMGMtMC43LDAuMS0xLjMsMC4yLTIsMC4yJiN4ZDsmI3hhOyYjeDk7JiN4OTtjLTEuNSwwLTMuMS0wLjMtNC41LTAuOWMtMS41LTAuNi0yLjktMS40LTQuMi0yLjVjLTIuNy0yLjEtNS4yLTUtNy41LTguNmMtMS44LTIuOS0zLjYtNi4yLTUuMS05LjljLTAuMSwwLTAuMywwLTAuNC0wLjFsNC41LTQuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7YzMuNCwwLjMsNi45LDAuNSwxMC41LDAuNWM4LjYsMCwxNi42LTEsMjMuNS0yLjdjNi45LTEuNywxMi42LTQuMSwxNi40LTYuOGMyLjYtMS44LD'+
			'QuMy0zLjcsNS4yLTUuNmMwLjUtMSwwLjctMiwwLjctMy4xJiN4ZDsmI3hhOyYjeDk7JiN4OTtjMC0xLTAuMi0yLTAuNy0zLjFjLTAuNS0xLTEuMy0yLjEtMi4zLTMuMmMtMi4xLTIuMS01LjQtNC4yLTkuNi02Yy0zLjEtMS4zLTYuNi0yLjQtMTAuNS0zLjRsNC4xLTQuMWM2LjQsMS44LDExLjgsNC4xLDE2LDcmI3hkOyYjeGE7JiN4OTsmI3g5O2MzLjEsMi4yLDUuNCw0LjYsNi44LDcuNWMwLjgsMS42LDEuMiwzLjQsMS4yLDUuMmMwLDEuOC0wLjQsMy42LTEuMiw1LjJDMTEzLjgsNzEuOSwxMTIuNyw3My40LDExMS4zLDc0Ljh6Ii8+CiAgPGc+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik01'+
			'MC4xLDQ3LjljMi41LTAuNCw1LjEtMC42LDcuOC0wLjhsLTEtNC45Yy0yLjIsMC4yLTQuMywwLjQtNi40LDAuNkM1MC4zLDQ0LjQsNTAuMiw0Ni4xLDUwLjEsNDcuOXoiLz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTEwMy44LDI4LjFsLTEuOC0xLjhjLTAuMy0wLjMtMC44LTAuNS0xLjItMC41cy0wLjksMC4yLTEuMiwwLjVMMjYuMiw5OS41Yy0wLjcsMC43LTAuNywxLjcsMCwyLjRsMS44LDEuOCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC4zLDAuMywwLjgsMC41LDEuMiwwLjVzMC45LTAuMiwxLjItMC41bDczLjMtNzMuM0MxMDQuNCwyOS44LDEwNC40LDI4LjcsMTAzLjgsMjguMX'+
			'oiLz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTY2LjcsODEuMWMxLDAsMiwwLDMtMC4xbC0yLjMtMTEuNGwtMi42LDIuNkw2Ni43LDgxLjF6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik04NS40LDc5LjFjMC41LTAuMSwxLTAuMiwxLjYtMC4zYzAtNS41LTAuNi0xMS41LTEuOS0xNy43Yy0wLjUtMi41LTEuMS01LTEuNy03LjNsLTQuMSw0LjEmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzAuMywxLjQsMC43LDIuOCwwLjksNC4yYzEuMiw2LjEsMS44LDExLjksMS44LDE3LjNjMCwwLjIsMCwwLjMsMCwwLjVDODMuMiw3OS41LDg0LjMsNzkuMyw4NS40LDc5LjF6Ii8+CiAgIDxw'+
			'YXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik00Ni42LDc2LjNsNC4xLTQuMWMtMC4zLTEuNC0wLjYtMi44LTAuOS00LjJsMCwwQzQ4LjYsNjEuOSw0OCw1Ni4xLDQ4LDUwLjhjMC03LjEsMS0xMy4zLDIuOC0xNy43JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MwLjktMi4yLDEuOS0zLjksMy01YzAuNy0wLjcsMS4zLTEuMiwyLTEuNWw2LjcsMzMuOGwyLjYtMi42TDU4LjgsMjZjMC43LDAuMSwxLjQsMC4yLDIuMiwwLjVjMS42LDAuNywzLjUsMiw1LjQsNCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMi42LDIuOCw1LjIsNi44LDcuNSwxMS43QzcxLDQyLDY4LjEsNDEuOSw2NSw0MS45Yy0wLjMsMC0wLj'+
			'csMC0xLDBsMSw1YzMuNiwwLDcuMSwwLjIsMTAuNSwwLjVsNC41LTQuNWMtMC4xLDAtMC4zLDAtMC40LTAuMSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLTEuNS0zLjctMy4zLTctNS4xLTkuOWMtMi4zLTMuNi00LjgtNi41LTcuNS04LjZjLTEuMy0xLjEtMi43LTEuOS00LjItMi41Yy0xLjUtMC42LTMtMC45LTQuNS0wLjljLTAuNywwLTEuNCwwLjEtMiwwLjJ2MCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLTIuNCwwLjUtNC40LDEuNy02LjEsMy41Yy0yLjUsMi43LTQuMiw2LjQtNS40LDEwLjhjLTEuMiw0LjQtMS44LDkuNi0xLjgsMTUuM2MwLDUuNywwLjYsMTEuOCwxLjksMTguMiYjeGQ7'+
			'JiN4YTsmI3g5OyYjeDk7JiN4OTtDNDUuNCw3MS41LDQ2LDczLjksNDYuNiw3Ni4zeiIvPgogICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNNDIuMyw4MC42Yy0zLjktMC45LTcuNC0yLTEwLjUtMy4zYy00LjItMS44LTcuNC0zLjktOS42LTZjLTEuMS0xLjEtMS44LTIuMS0yLjMtMy4yYy0wLjUtMS0wLjctMi0wLjctMy4xaDAmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzAtMSwwLjItMiwwLjctMy4xYzAuOS0xLjgsMi42LTMuOCw1LjItNS42YzMuOC0yLjcsOS4zLTUsMTUuOS02LjdjMC0xLjgsMC4xLTMuNSwwLjMtNS4yYy00LjIsMS04LDIuMi0xMS41LDMuNyYjeGQ7JiN4YTsmI3g5OyYjeD'+
			'k7JiN4OTtjLTQuNiwyLTguNCw0LjMtMTEuMiw3LjFjLTEuNCwxLjQtMi41LDIuOS0zLjMsNC41Yy0wLjgsMS42LTEuMiwzLjQtMS4yLDUuMmMwLDEuOCwwLjQsMy42LDEuMiw1LjJjMS40LDIuOSwzLjgsNS4zLDYuOCw3LjUmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzQuMSwyLjksOS42LDUuMywxNiw3TDQyLjMsODAuNnoiLz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTExNC42LDU5LjhjLTEuNC0yLjktMy44LTUuMy02LjgtNy41Yy00LjEtMi45LTkuNi01LjMtMTYtN2wtNC4xLDQuMWMzLjksMC45LDcuNCwyLDEwLjUsMy40JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2M0LjIsMS44'+
			'LDcuNCwzLjksOS42LDZjMS4xLDEuMSwxLjgsMi4xLDIuMywzLjJjMC41LDEsMC43LDIsMC43LDMuMWMwLDEtMC4yLDItMC43LDMuMWMtMC45LDEuOC0yLjYsMy44LTUuMiw1LjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0zLjksMi43LTkuNiw1LjEtMTYuNCw2LjhjLTYuOSwxLjctMTQuOSwyLjctMjMuNSwyLjdjLTMuNiwwLTcuMi0wLjItMTAuNS0wLjVMNTAsODcuMWMwLjEsMCwwLjMsMCwwLjQsMC4xJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MxLjUsMy43LDMuMyw3LDUuMSw5LjljMi4zLDMuNiw0LjgsNi41LDcuNSw4LjZjMS4zLDEuMSwyLjcsMS45LDQuMiwyLjVjMS41LDAuNiwzLD'+
			'AuOSw0LjUsMC45YzAuNywwLDEuMy0wLjEsMi0wLjJsMCwwJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MyLjQtMC41LDQuNC0xLjcsNi4xLTMuNWMyLjUtMi43LDQuMi02LjQsNS40LTEwLjhjMC41LTIsMC45LTQuMiwxLjItNi41Yy0wLjYsMC4xLTEuMiwwLjMtMS44LDAuNGMtMS4xLDAuMi0yLjIsMC40LTMuMywwLjUmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0wLjUsMy0xLjIsNS43LTIuMSw4Yy0wLjksMi4yLTEuOSwzLjktMyw1Yy0wLjYsMC43LTEuMywxLjItMiwxLjVsLTIuNy0xMy41Yy0xLDAuMS0yLDAuMS0zLDAuMWwyLjgsMTQmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0wLjct'+
			'MC4xLTEuNC0wLjItMi4yLTAuNWMtMS43LTAuNy0zLjUtMi01LjQtNGMtMi42LTIuOC01LjItNi44LTcuNS0xMS43QzU5LDg4LDYyLDg4LjEsNjUsODguMWMxMy42LDAsMjYtMi4zLDM1LjItNi4yJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2M0LjYtMiw4LjQtNC4zLDExLjItNy4xYzEuNC0xLjQsMi41LTIuOSwzLjMtNC41YzAuOC0xLjYsMS4yLTMuNCwxLjItNS4yQzExNS44LDYzLjIsMTE1LjQsNjEuNCwxMTQuNiw1OS44eiIvPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg==';
		me._gyro_off__imgo.setAttribute('src',hs);
		elo.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;visibility:hidden;pointer-events:none;;');
		elo['ondragstart']=function() { return false; };
		el.appendChild(elo);
		el.ggId="gyro_off";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 0px;';
		hs+='opacity : 0;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : hidden;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._gyro_off.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._gyro_off.logicBlock_alpha = function() {
			var newLogicStateAlpha;
			if (
				((player.getUseGyro() == true))
			)
			{
				newLogicStateAlpha = 0;
			}
			else {
				newLogicStateAlpha = -1;
			}
			if (me._gyro_off.ggCurrentLogicStateAlpha != newLogicStateAlpha) {
				me._gyro_off.ggCurrentLogicStateAlpha = newLogicStateAlpha;
				me._gyro_off.style[domTransition]='opacity 0s';
				if (me._gyro_off.ggCurrentLogicStateAlpha == 0) {
					me._gyro_off.style.visibility=me._gyro_off.ggVisible?'inherit':'hidden';
					me._gyro_off.style.opacity=1;
				}
				else {
					me._gyro_off.style.visibility="hidden";
					me._gyro_off.style.opacity=0;
				}
			}
		}
		me._gyro_off.onmouseover=function (e) {
			me._gyro_off__img.style.visibility='hidden';
			me._gyro_off__imgo.style.visibility='inherit';
		}
		me._gyro_off.onmouseout=function (e) {
			me._gyro_off__img.style.visibility='inherit';
			me._gyro_off__imgo.style.visibility='hidden';
		}
		me._gyro_off.ggUpdatePosition=function (useTransition) {
		}
		me._gyro.appendChild(me._gyro_off);
		me.divSkin.appendChild(me._gyro);
		el=me._button_direction=document.createElement('div');
		el.ggId="button_direction";
		el.ggDx=0;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_container direction_tb";
		el.ggType='container';
		hs ='';
		hs+='bottom : 20px;';
		hs+='height : 62px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='visibility : inherit;';
		hs+='width : 82px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._button_direction.ggIsActive=function() {
			return false;
		}
		el.ggElementNodeId=function() {
			return player.getCurrentNode();
		}
		me._button_direction.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
		}
		el=me._button_image_right=document.createElement('div');
		els=me._button_image_right__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0xNzUsMzQwLjljLTMxLDAtNTYuMSwyNS4xLTU2LjEsNTYuMWMwLDMxLDI1LjEsNTYuMSw1Ni4xLDU2LjFzNTYuMS0yNS4xLDU2LjEtNTYuMSYjeGQ7JiN4YTsmI3g5OyYjeDk7Qy0xMTguOSwzNjYtMTQ0LDM0MC45LTE3NSwzNDAuOXogTS0xNDksMzk4LjFsLTMwLjEsMzAuMWMtMC42LDAuNi0xLjYsMC42LTIuMiwwbC0xMS4zLTExLjNjLTAuNi0wLjYtMC42LTEuNiwwLTIuMmwxNy43LTE3LjcmI3hkOyYjeGE7JiN4OTsmI3g5O2wtMTcuNy0xNy43Yy0wLjYtMC42LTAuNi0xLjYsMC0yLjJsMTEuMy0xMS4zYzAuNi0wLjYsMS42'+
			'LTAuNiwyLjIsMGwzMC4xLDMwYzAuMywwLjMsMC40LDAuNywwLjQsMS4xJiN4ZDsmI3hhOyYjeDk7JiN4OTtDLTE0OC41LDM5Ny40LTE0OC42LDM5Ny44LTE0OSwzOTguMXoiLz4KIDwvZz4KIDxnIGlkPSJMYXllcl8yIj4KICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNLTE5Mi41LDM3OS4zbDE3LjcsMTcuN2wtMTcuNywxNy43Yy0wLjYsMC42LTAuNiwxLjYsMCwyLjJsMTEuMywxMS4zYzAuNiwwLjYsMS42LDAuNiwyLjIsMGwzMC4xLTMwLjEmI3hkOyYjeGE7JiN4OTsmI3g5O2MwLjMtMC4zLDAuNS0wLjcsMC40LTEuMWMwLTAuNC0wLjEtMC44LTAuNC0xLjFsLTMwLjEtMzBjLTAuNi0wLjYtMS'+
			'42LTAuNi0yLjIsMGwtMTEuMywxMS4zQy0xOTMuMSwzNzcuNy0xOTMuMSwzNzguNy0xOTIuNSwzNzkuMyYjeGQ7JiN4YTsmI3g5OyYjeDk7eiIvPgogPC9nPgo8L3N2Zz4K';
		me._button_image_right__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		elo=me._button_image_right__imgo=document.createElement('img');
		elo.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0xNzUsMzM0LjZjLTM0LjQsMC02Mi40LDI3LjktNjIuNCw2Mi40YzAsMzQuNCwyNy45LDYyLjQsNjIuNCw2Mi40czYyLjQtMjcuOSw2Mi40LTYyLjQmI3hkOyYjeGE7JiN4OTsmI3g5O0MtMTEyLjYsMzYyLjYtMTQwLjYsMzM0LjYtMTc1LDMzNC42eiBNLTE0Ni4xLDM5OC4ybC0zMy41LDMzLjRjLTAuNywwLjctMS43LDAuNy0yLjQsMGwtMTIuNS0xMi41Yy0wLjctMC43LTAuNy0xLjcsMC0yLjQmI3hkOyYjeGE7JiN4OTsmI3g5O2wxOS43LTE5LjdsLTE5LjctMTkuN2MtMC43LTAuNy0wLjctMS43LDAtMi40bDEyLjUtMTIuNWMw'+
			'LjctMC43LDEuNy0wLjcsMi40LDBsMzMuNSwzMy40YzAuMywwLjMsMC41LDAuOCwwLjUsMS4yJiN4ZDsmI3hhOyYjeDk7JiN4OTtDLTE0NS42LDM5Ny40LTE0NS43LDM5Ny45LTE0Ni4xLDM5OC4yeiIvPgogPC9nPgogPGcgaWQ9IkxheWVyXzIiPgogIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTk0LjQsMzc3LjNsMTkuNywxOS43bC0xOS43LDE5LjdjLTAuNywwLjctMC43LDEuNywwLDIuNGwxMi41LDEyLjVjMC43LDAuNywxLjcsMC43LDIuNCwwbDMzLjUtMzMuNCYjeGQ7JiN4YTsmI3g5OyYjeDk7YzAuMy0wLjMsMC41LTAuOCwwLjUtMS4zYzAtMC40LTAuMi0wLjktMC41LTEuMmwtMzMuNS'+
			'0zMy40Yy0wLjctMC43LTEuNy0wLjctMi40LDBsLTEyLjUsMTIuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7Qy0xOTUuMSwzNzUuNi0xOTUuMSwzNzYuNi0xOTQuNCwzNzcuM3oiLz4KIDwvZz4KPC9zdmc+Cg==';
		me._button_image_right__imgo.setAttribute('src',hs);
		elo.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;visibility:hidden;pointer-events:none;;');
		elo['ondragstart']=function() { return false; };
		el.appendChild(elo);
		el.ggId="button_image_right";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 51px;';
		hs+='position : absolute;';
		hs+='top : 15px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._button_image_right.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._button_image_right.onmouseover=function (e) {
			me._button_image_right__img.style.visibility='hidden';
			me._button_image_right__imgo.style.visibility='inherit';
		}
		me._button_image_right.onmouseout=function (e) {
			me._button_image_right__img.style.visibility='inherit';
			me._button_image_right__imgo.style.visibility='hidden';
			me.elementMouseDown['button_image_right']=false;
		}
		me._button_image_right.onmousedown=function (e) {
			me.elementMouseDown['button_image_right']=true;
		}
		me._button_image_right.onmouseup=function (e) {
			me.elementMouseDown['button_image_right']=false;
		}
		me._button_image_right.ontouchend=function (e) {
			me.elementMouseDown['button_image_right']=false;
		}
		me._button_image_right.ggUpdatePosition=function (useTransition) {
		}
		me._button_direction.appendChild(me._button_image_right);
		el=me._button_image_left=document.createElement('div');
		els=me._button_image_left__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0xNzUsMzQwLjhjLTMxLDAtNTYuMiwyNS4xLTU2LjIsNTYuMnMyNS4xLDU2LjIsNTYuMiw1Ni4yczU2LjItMjUuMSw1Ni4yLTU2LjImI3hkOyYjeGE7JiN4OTsmI3g5O0MtMTE4LjgsMzY2LTE0NCwzNDAuOC0xNzUsMzQwLjh6IE0tMTU3LjUsNDE2LjlsLTExLjMsMTEuM2MtMC42LDAuNi0xLjUsMC42LTIuMiwwbC0zMC4yLTMwLjFjLTAuMy0wLjMtMC40LTAuNy0wLjQtMS4xJiN4ZDsmI3hhOyYjeDk7JiN4OTtjMC0wLjUsMC4xLTAuOCwwLjQtMS4ybDMwLjItMzAuMWMwLjYtMC42LDEuNS0wLjYsMi4yLDBsMTEuMywxMS4zYzAu'+
			'NiwwLjYsMC42LDEuNSwwLDIuMmwtMTcuNywxNy43bDE3LjcsMTcuNyYjeGQ7JiN4YTsmI3g5OyYjeDk7Qy0xNTYuOSw0MTUuNC0xNTYuOSw0MTYuMy0xNTcuNSw0MTYuOXoiLz4KIDwvZz4KIDxnIGlkPSJMYXllcl8yIj4KICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNLTE1Ny41LDQxNC43bC0xNy43LTE3LjdsMTcuNy0xNy43YzAuNi0wLjYsMC42LTEuNSwwLTIuMmwtMTEuMy0xMS4zYy0wLjYtMC42LTEuNS0wLjYtMi4yLDBsLTMwLjIsMzAuMSYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0wLjMsMC4zLTAuNCwwLjctMC40LDEuMmMwLDAuNCwwLjIsMC44LDAuNCwxLjFsMzAuMiwzMC4xYzAuNiwwLj'+
			'YsMS41LDAuNiwyLjIsMGwxMS4zLTExLjNDLTE1Ni45LDQxNi4zLTE1Ni45LDQxNS40LTE1Ny41LDQxNC43JiN4ZDsmI3hhOyYjeDk7JiN4OTt6Ii8+CiA8L2c+Cjwvc3ZnPgo=';
		me._button_image_left__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		elo=me._button_image_left__imgo=document.createElement('img');
		elo.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0xNzUsMzM0LjZjLTM0LjQsMC02Mi40LDI3LjktNjIuNCw2Mi40czI3LjksNjIuNCw2Mi40LDYyLjRzNjIuNC0yNy45LDYyLjQtNjIuNCYjeGQ7JiN4YTsmI3g5OyYjeDk7Qy0xMTIuNiwzNjIuNi0xNDAuNiwzMzQuNi0xNzUsMzM0LjZ6IE0tMTU1LjYsNDE5LjFsLTEyLjUsMTIuNWMtMC43LDAuNy0xLjcsMC43LTIuNCwwbC0zMy41LTMzLjRjLTAuMy0wLjMtMC41LTAuOC0wLjUtMS4yJiN4ZDsmI3hhOyYjeDk7JiN4OTtjMC0wLjUsMC4xLTAuOSwwLjUtMS4zbDMzLjUtMzMuNGMwLjctMC43LDEuNy0wLjcsMi40LDBsMTIuNSwx'+
			'Mi41YzAuNywwLjcsMC43LDEuNywwLDIuNGwtMTkuNywxOS43bDE5LjcsMTkuNyYjeGQ7JiN4YTsmI3g5OyYjeDk7Qy0xNTQuOSw0MTcuNC0xNTQuOSw0MTguNC0xNTUuNiw0MTkuMXoiLz4KIDwvZz4KIDxnIGlkPSJMYXllcl8yIj4KICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNLTE1NS42LDQxNi43bC0xOS43LTE5LjdsMTkuNy0xOS43YzAuNy0wLjcsMC43LTEuNywwLTIuNGwtMTIuNS0xMi41Yy0wLjctMC43LTEuNy0wLjctMi40LDBsLTMzLjUsMzMuNCYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0wLjMsMC4zLTAuNSwwLjgtMC41LDEuM2MwLDAuNCwwLjIsMC45LDAuNSwxLjJsMzMuNSwzMy40Yz'+
			'AuNywwLjcsMS43LDAuNywyLjQsMGwxMi41LTEyLjVDLTE1NC45LDQxOC40LTE1NC45LDQxNy40LTE1NS42LDQxNi43JiN4ZDsmI3hhOyYjeDk7JiN4OTt6Ii8+CiA8L2c+Cjwvc3ZnPgo=';
		me._button_image_left__imgo.setAttribute('src',hs);
		elo.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;visibility:hidden;pointer-events:none;;');
		elo['ondragstart']=function() { return false; };
		el.appendChild(elo);
		el.ggId="button_image_left";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : -1px;';
		hs+='position : absolute;';
		hs+='top : 15px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._button_image_left.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._button_image_left.onmouseover=function (e) {
			me._button_image_left__img.style.visibility='hidden';
			me._button_image_left__imgo.style.visibility='inherit';
		}
		me._button_image_left.onmouseout=function (e) {
			me._button_image_left__img.style.visibility='inherit';
			me._button_image_left__imgo.style.visibility='hidden';
			me.elementMouseDown['button_image_left']=false;
		}
		me._button_image_left.onmousedown=function (e) {
			me.elementMouseDown['button_image_left']=true;
		}
		me._button_image_left.onmouseup=function (e) {
			me.elementMouseDown['button_image_left']=false;
		}
		me._button_image_left.ontouchend=function (e) {
			me.elementMouseDown['button_image_left']=false;
		}
		me._button_image_left.ggUpdatePosition=function (useTransition) {
		}
		me._button_direction.appendChild(me._button_image_left);
		el=me._button_image_down=document.createElement('div');
		els=me._button_image_down__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0xNzUsMzQwLjljLTMxLDAtNTYuMSwyNS4xLTU2LjEsNTYuMXMyNS4xLDU2LjEsNTYuMSw1Ni4xYzMxLDAsNTYuMS0yNS4xLDU2LjEtNTYuMVMtMTQ0LDM0MC45LTE3NSwzNDAuOSYjeGQ7JiN4YTsmI3g5OyYjeDk7eiBNLTE0My44LDM5Mi45bC0zMCwzMC4xYy0wLjMsMC4zLTAuNywwLjQtMS4xLDAuNGMtMC40LDAtMC44LTAuMS0xLjEtMC40bC0zMC4xLTMwLjFjLTAuNi0wLjYtMC42LTEuNiwwLTIuMmwxMS4zLTExLjMmI3hkOyYjeGE7JiN4OTsmI3g5O2MwLjYtMC42LDEuNi0wLjYsMi4yLDBsMTcuNywxNy43bDE3LjctMTcu'+
			'N2MwLjYtMC42LDEuNi0wLjYsMi4yLDBsMTEuMywxMS4zQy0xNDMuMiwzOTEuNC0xNDMuMiwzOTIuMy0xNDMuOCwzOTIuOXoiLz4KIDwvZz4KIDxnIGlkPSJMYXllcl8yIj4KICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNLTE1Ny4zLDM3OS41bC0xNy43LDE3LjdsLTE3LjctMTcuN2MtMC42LTAuNi0xLjYtMC42LTIuMiwwbC0xMS4zLDExLjNjLTAuNiwwLjYtMC42LDEuNiwwLDIuMmwzMC4xLDMwLjEmI3hkOyYjeGE7JiN4OTsmI3g5O2MwLjMsMC4zLDAuNywwLjUsMS4xLDAuNGMwLjQsMCwwLjgtMC4xLDEuMS0wLjRsMzAtMzAuMWMwLjYtMC42LDAuNi0xLjYsMC0yLjJsLTExLjMtMTEuM0MtMT'+
			'U1LjcsMzc4LjktMTU2LjcsMzc4LjktMTU3LjMsMzc5LjV6Ii8+CiA8L2c+Cjwvc3ZnPgo=';
		me._button_image_down__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		elo=me._button_image_down__imgo=document.createElement('img');
		elo.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0xNzUsMzM0LjZjLTM0LjQsMC02Mi40LDI3LjktNjIuNCw2Mi40czI3LjksNjIuNCw2Mi40LDYyLjRjMzQuNCwwLDYyLjQtMjcuOSw2Mi40LTYyLjQmI3hkOyYjeGE7JiN4OTsmI3g5O1MtMTQwLjYsMzM0LjYtMTc1LDMzNC42eiBNLTE0MC40LDM5Mi41bC0zMy40LDMzLjVjLTAuMywwLjMtMC44LDAuNS0xLjIsMC41Yy0wLjUsMC0wLjktMC4xLTEuMy0wLjVsLTMzLjQtMzMuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0wLjctMC43LTAuNy0xLjcsMC0yLjRsMTIuNS0xMi41YzAuNy0wLjcsMS43LTAuNywyLjQsMGwxOS43LDE5Ljds'+
			'MTkuNy0xOS43YzAuNy0wLjcsMS43LTAuNywyLjQsMGwxMi41LDEyLjUmI3hkOyYjeGE7JiN4OTsmI3g5O0MtMTM5LjcsMzkwLjctMTM5LjcsMzkxLjgtMTQwLjQsMzkyLjV6Ii8+CiA8L2c+CiA8ZyBpZD0iTGF5ZXJfMiI+CiAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTS0xNTUuMywzNzcuNmwtMTkuNywxOS43bC0xOS43LTE5LjdjLTAuNy0wLjctMS43LTAuNy0yLjQsMGwtMTIuNSwxMi41Yy0wLjcsMC43LTAuNywxLjcsMCwyLjRsMzMuNCwzMy41JiN4ZDsmI3hhOyYjeDk7JiN4OTtjMC4zLDAuMywwLjgsMC41LDEuMywwLjVjMC40LDAsMC45LTAuMiwxLjItMC41bDMzLjQtMzMuNWMwLjctMC'+
			'43LDAuNy0xLjcsMC0yLjRsLTEyLjUtMTIuNUMtMTUzLjYsMzc2LjktMTU0LjYsMzc2LjktMTU1LjMsMzc3LjYmI3hkOyYjeGE7JiN4OTsmI3g5O3oiLz4KIDwvZz4KPC9zdmc+Cg==';
		me._button_image_down__imgo.setAttribute('src',hs);
		elo.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;visibility:hidden;pointer-events:none;;');
		elo['ondragstart']=function() { return false; };
		el.appendChild(elo);
		el.ggId="button_image_down";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 25px;';
		hs+='position : absolute;';
		hs+='top : 31px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._button_image_down.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._button_image_down.onmouseover=function (e) {
			me._button_image_down__img.style.visibility='hidden';
			me._button_image_down__imgo.style.visibility='inherit';
		}
		me._button_image_down.onmouseout=function (e) {
			me._button_image_down__img.style.visibility='inherit';
			me._button_image_down__imgo.style.visibility='hidden';
			me.elementMouseDown['button_image_down']=false;
		}
		me._button_image_down.onmousedown=function (e) {
			me.elementMouseDown['button_image_down']=true;
		}
		me._button_image_down.onmouseup=function (e) {
			me.elementMouseDown['button_image_down']=false;
		}
		me._button_image_down.ontouchend=function (e) {
			me.elementMouseDown['button_image_down']=false;
		}
		me._button_image_down.ggUpdatePosition=function (useTransition) {
		}
		me._button_direction.appendChild(me._button_image_down);
		el=me._button_image_up=document.createElement('div');
		els=me._button_image_up__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0xNzUsMzQwLjljLTMxLDAtNTYuMSwyNS4xLTU2LjEsNTYuMXMyNS4xLDU2LjEsNTYuMSw1Ni4xYzMxLDAsNTYuMS0yNS4xLDU2LjEtNTYuMVMtMTQ0LDM0MC45LTE3NSwzNDAuOSYjeGQ7JiN4YTsmI3g5OyYjeDk7eiBNLTE0My44LDQwMy4ybC0xMS4zLDExLjNjLTAuNiwwLjYtMS42LDAuNi0yLjIsMGwtMTcuNy0xNy43bC0xNy43LDE3LjdjLTAuNiwwLjYtMS42LDAuNi0yLjIsMGwtMTEuMy0xMS4zJiN4ZDsmI3hhOyYjeDk7JiN4OTtjLTAuNi0wLjYtMC42LTEuNiwwLTIuMmwzMC0zMC4xYzAuMy0wLjMsMC43LTAuNCwxLjEt'+
			'MC40YzAuNCwwLDAuOCwwLjEsMS4xLDAuNGwzMC4xLDMwLjFDLTE0My4yLDQwMS43LTE0My4yLDQwMi42LTE0My44LDQwMy4yeiIvPgogPC9nPgogPGcgaWQ9IkxheWVyXzIiPgogIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTkyLjcsNDE0LjVsMTcuNy0xNy43bDE3LjcsMTcuN2MwLjYsMC42LDEuNiwwLjYsMi4yLDBsMTEuMy0xMS4zYzAuNi0wLjYsMC42LTEuNiwwLTIuMmwtMzAuMS0zMC4xJiN4ZDsmI3hhOyYjeDk7JiN4OTtjLTAuMy0wLjMtMC43LTAuNS0xLjEtMC40Yy0wLjQsMC0wLjgsMC4xLTEuMSwwLjRsLTMwLDMwLjFjLTAuNiwwLjYtMC42LDEuNiwwLDIuMmwxMS4zLDExLjMmI3'+
			'hkOyYjeGE7JiN4OTsmI3g5O0MtMTk0LjMsNDE1LjEtMTkzLjMsNDE1LjEtMTkyLjcsNDE0LjV6Ii8+CiA8L2c+Cjwvc3ZnPgo=';
		me._button_image_up__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		elo=me._button_image_up__imgo=document.createElement('img');
		elo.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0xNzUsMzM0LjZjLTM0LjQsMC02Mi40LDI3LjktNjIuNCw2Mi40czI3LjksNjIuNCw2Mi40LDYyLjRjMzQuNCwwLDYyLjQtMjcuOSw2Mi40LTYyLjQmI3hkOyYjeGE7JiN4OTsmI3g5O1MtMTQwLjYsMzM0LjYtMTc1LDMzNC42eiBNLTE0MC40LDQwMy45bC0xMi41LDEyLjVjLTAuNywwLjctMS43LDAuNy0yLjQsMGwtMTkuNy0xOS43bC0xOS43LDE5LjdjLTAuNywwLjctMS43LDAuNy0yLjQsMCYjeGQ7JiN4YTsmI3g5OyYjeDk7bC0xMi41LTEyLjVjLTAuNy0wLjctMC43LTEuNywwLTIuNGwzMy40LTMzLjVjMC4zLTAuMywwLjgt'+
			'MC41LDEuMi0wLjVjMC41LDAsMC45LDAuMSwxLjMsMC41bDMzLjQsMzMuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7Qy0xMzkuNyw0MDIuMi0xMzkuNyw0MDMuMy0xNDAuNCw0MDMuOXoiLz4KIDwvZz4KIDxnIGlkPSJMYXllcl8yIj4KICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNLTE5NC43LDQxNi40bDE5LjctMTkuN2wxOS43LDE5LjdjMC43LDAuNywxLjcsMC43LDIuNCwwbDEyLjUtMTIuNWMwLjctMC43LDAuNy0xLjcsMC0yLjRsLTMzLjQtMzMuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0wLjMtMC4zLTAuOC0wLjUtMS4zLTAuNWMtMC40LDAtMC45LDAuMi0xLjIsMC41bC0zMy40LDMzLjVjLTAuNy'+
			'wwLjctMC43LDEuNywwLDIuNGwxMi41LDEyLjUmI3hkOyYjeGE7JiN4OTsmI3g5O0MtMTk2LjQsNDE3LjEtMTk1LjQsNDE3LjEtMTk0LjcsNDE2LjR6Ii8+CiA8L2c+Cjwvc3ZnPgo=';
		me._button_image_up__imgo.setAttribute('src',hs);
		elo.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;visibility:hidden;pointer-events:none;;');
		elo['ondragstart']=function() { return false; };
		el.appendChild(elo);
		el.ggId="button_image_up";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : 25px;';
		hs+='position : absolute;';
		hs+='top : -1px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._button_image_up.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return player.getCurrentNode();
		}
		me._button_image_up.onmouseover=function (e) {
			me._button_image_up__img.style.visibility='hidden';
			me._button_image_up__imgo.style.visibility='inherit';
		}
		me._button_image_up.onmouseout=function (e) {
			me._button_image_up__img.style.visibility='inherit';
			me._button_image_up__imgo.style.visibility='hidden';
			me.elementMouseDown['button_image_up']=false;
		}
		me._button_image_up.onmousedown=function (e) {
			me.elementMouseDown['button_image_up']=true;
		}
		me._button_image_up.onmouseup=function (e) {
			me.elementMouseDown['button_image_up']=false;
		}
		me._button_image_up.ontouchend=function (e) {
			me.elementMouseDown['button_image_up']=false;
		}
		me._button_image_up.ggUpdatePosition=function (useTransition) {
		}
		me._button_direction.appendChild(me._button_image_up);
		me.divSkin.appendChild(me._button_direction);
		var clonedNormalElement = new SkinElement_marker_normal_Class(this,me._marker_node6);
		me._marker_node6__normal = clonedNormalElement._marker_normal;
		me._marker_node6__normal.style.visibility='inherit';
		me._marker_node6__normal.style.left='0px';
		me._marker_node6__normal.style.top='0px';
		me._marker_node6.ggMarkerNormal=me._marker_node6__normal;
		me._marker_node6.ggMarkerInstances.push(clonedNormalElement);
		var clonedActiveElement = new SkinElement_marker_active_Class(this,me._marker_node6);
		me._marker_node6__active= clonedActiveElement._marker_active;
		me._marker_node6__active.style.visibility='hidden';
		me._marker_node6__active.style.left='0px';
		me._marker_node6__active.style.top='0px';
		me._marker_node6.ggMarkerActive=me._marker_node6__active;
		me._marker_node6.ggMarkerInstances.push(clonedActiveElement);
		if (me._marker_node6.firstChild) {
			me._marker_node6.insertBefore(me._marker_node6__active,me._marker_node6.firstChild);
		} else {
			me._marker_node6.appendChild(me._marker_node6__active);
		}
		if (me._marker_node6.firstChild) {
			me._marker_node6.insertBefore(me._marker_node6__normal,me._marker_node6.firstChild);
		} else {
			me._marker_node6.appendChild(me._marker_node6__normal);
		}
		for (var i = 0; i < me._marker_node6.childNodes.length; i++) {
			me._marker_node6.ggMarkerInstances.push(me._marker_node6.childNodes[i]);
		}
		me._marker_node6.callChildLogicBlocks_configloaded = function(){
			if(me._marker_node6.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node6.ggMarkerInstances.length; i++) {
					if((me._marker_node6.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node6)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node6)<0 && i==0) || (i>1))) {
					if (me._marker_node6.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node6.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node6.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node6.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node6.ggMarkerInstances.length; i++) {
					if((me._marker_node6.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node6)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node6)<0 && i==0) || (i>1))) {
					if (me._marker_node6.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node6.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node6.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node6.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node6.ggMarkerInstances.length; i++) {
					if((me._marker_node6.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node6)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node6)<0 && i==0) || (i>1))) {
					if (me._marker_node6.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node6.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node6.callChildLogicBlocks_hastouch = function(){
			if(me._marker_node6.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node6.ggMarkerInstances.length; i++) {
					if((me._marker_node6.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node6)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node6)<0 && i==0) || (i>1))) {
					if (me._marker_node6.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node6.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node6.callChildLogicBlocks_configloaded();
		me._marker_node6.callChildLogicBlocks_mouseover();
		me._marker_node6.callChildLogicBlocks_mouseover();
		me._marker_node6.callChildLogicBlocks_hastouch();
		var clonedNormalElement = new SkinElement_marker_normal_Class(this,me._marker_node5);
		me._marker_node5__normal = clonedNormalElement._marker_normal;
		me._marker_node5__normal.style.visibility='inherit';
		me._marker_node5__normal.style.left='0px';
		me._marker_node5__normal.style.top='0px';
		me._marker_node5.ggMarkerNormal=me._marker_node5__normal;
		me._marker_node5.ggMarkerInstances.push(clonedNormalElement);
		var clonedActiveElement = new SkinElement_marker_active_Class(this,me._marker_node5);
		me._marker_node5__active= clonedActiveElement._marker_active;
		me._marker_node5__active.style.visibility='hidden';
		me._marker_node5__active.style.left='0px';
		me._marker_node5__active.style.top='0px';
		me._marker_node5.ggMarkerActive=me._marker_node5__active;
		me._marker_node5.ggMarkerInstances.push(clonedActiveElement);
		if (me._marker_node5.firstChild) {
			me._marker_node5.insertBefore(me._marker_node5__active,me._marker_node5.firstChild);
		} else {
			me._marker_node5.appendChild(me._marker_node5__active);
		}
		if (me._marker_node5.firstChild) {
			me._marker_node5.insertBefore(me._marker_node5__normal,me._marker_node5.firstChild);
		} else {
			me._marker_node5.appendChild(me._marker_node5__normal);
		}
		for (var i = 0; i < me._marker_node5.childNodes.length; i++) {
			me._marker_node5.ggMarkerInstances.push(me._marker_node5.childNodes[i]);
		}
		me._marker_node5.callChildLogicBlocks_configloaded = function(){
			if(me._marker_node5.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node5.ggMarkerInstances.length; i++) {
					if((me._marker_node5.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node5)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node5)<0 && i==0) || (i>1))) {
					if (me._marker_node5.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node5.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node5.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node5.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node5.ggMarkerInstances.length; i++) {
					if((me._marker_node5.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node5)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node5)<0 && i==0) || (i>1))) {
					if (me._marker_node5.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node5.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node5.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node5.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node5.ggMarkerInstances.length; i++) {
					if((me._marker_node5.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node5)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node5)<0 && i==0) || (i>1))) {
					if (me._marker_node5.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node5.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node5.callChildLogicBlocks_hastouch = function(){
			if(me._marker_node5.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node5.ggMarkerInstances.length; i++) {
					if((me._marker_node5.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node5)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node5)<0 && i==0) || (i>1))) {
					if (me._marker_node5.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node5.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node5.callChildLogicBlocks_configloaded();
		me._marker_node5.callChildLogicBlocks_mouseover();
		me._marker_node5.callChildLogicBlocks_mouseover();
		me._marker_node5.callChildLogicBlocks_hastouch();
		var clonedNormalElement = new SkinElement_marker_normal_Class(this,me._marker_node4);
		me._marker_node4__normal = clonedNormalElement._marker_normal;
		me._marker_node4__normal.style.visibility='inherit';
		me._marker_node4__normal.style.left='0px';
		me._marker_node4__normal.style.top='0px';
		me._marker_node4.ggMarkerNormal=me._marker_node4__normal;
		me._marker_node4.ggMarkerInstances.push(clonedNormalElement);
		var clonedActiveElement = new SkinElement_marker_active_Class(this,me._marker_node4);
		me._marker_node4__active= clonedActiveElement._marker_active;
		me._marker_node4__active.style.visibility='hidden';
		me._marker_node4__active.style.left='0px';
		me._marker_node4__active.style.top='0px';
		me._marker_node4.ggMarkerActive=me._marker_node4__active;
		me._marker_node4.ggMarkerInstances.push(clonedActiveElement);
		if (me._marker_node4.firstChild) {
			me._marker_node4.insertBefore(me._marker_node4__active,me._marker_node4.firstChild);
		} else {
			me._marker_node4.appendChild(me._marker_node4__active);
		}
		if (me._marker_node4.firstChild) {
			me._marker_node4.insertBefore(me._marker_node4__normal,me._marker_node4.firstChild);
		} else {
			me._marker_node4.appendChild(me._marker_node4__normal);
		}
		for (var i = 0; i < me._marker_node4.childNodes.length; i++) {
			me._marker_node4.ggMarkerInstances.push(me._marker_node4.childNodes[i]);
		}
		me._marker_node4.callChildLogicBlocks_configloaded = function(){
			if(me._marker_node4.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node4.ggMarkerInstances.length; i++) {
					if((me._marker_node4.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node4)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node4)<0 && i==0) || (i>1))) {
					if (me._marker_node4.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node4.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node4.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node4.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node4.ggMarkerInstances.length; i++) {
					if((me._marker_node4.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node4)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node4)<0 && i==0) || (i>1))) {
					if (me._marker_node4.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node4.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node4.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node4.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node4.ggMarkerInstances.length; i++) {
					if((me._marker_node4.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node4)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node4)<0 && i==0) || (i>1))) {
					if (me._marker_node4.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node4.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node4.callChildLogicBlocks_hastouch = function(){
			if(me._marker_node4.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node4.ggMarkerInstances.length; i++) {
					if((me._marker_node4.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node4)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node4)<0 && i==0) || (i>1))) {
					if (me._marker_node4.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node4.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node4.callChildLogicBlocks_configloaded();
		me._marker_node4.callChildLogicBlocks_mouseover();
		me._marker_node4.callChildLogicBlocks_mouseover();
		me._marker_node4.callChildLogicBlocks_hastouch();
		var clonedNormalElement = new SkinElement_marker_normal_Class(this,me._marker_node3);
		me._marker_node3__normal = clonedNormalElement._marker_normal;
		me._marker_node3__normal.style.visibility='inherit';
		me._marker_node3__normal.style.left='0px';
		me._marker_node3__normal.style.top='0px';
		me._marker_node3.ggMarkerNormal=me._marker_node3__normal;
		me._marker_node3.ggMarkerInstances.push(clonedNormalElement);
		var clonedActiveElement = new SkinElement_marker_active_Class(this,me._marker_node3);
		me._marker_node3__active= clonedActiveElement._marker_active;
		me._marker_node3__active.style.visibility='hidden';
		me._marker_node3__active.style.left='0px';
		me._marker_node3__active.style.top='0px';
		me._marker_node3.ggMarkerActive=me._marker_node3__active;
		me._marker_node3.ggMarkerInstances.push(clonedActiveElement);
		if (me._marker_node3.firstChild) {
			me._marker_node3.insertBefore(me._marker_node3__active,me._marker_node3.firstChild);
		} else {
			me._marker_node3.appendChild(me._marker_node3__active);
		}
		if (me._marker_node3.firstChild) {
			me._marker_node3.insertBefore(me._marker_node3__normal,me._marker_node3.firstChild);
		} else {
			me._marker_node3.appendChild(me._marker_node3__normal);
		}
		for (var i = 0; i < me._marker_node3.childNodes.length; i++) {
			me._marker_node3.ggMarkerInstances.push(me._marker_node3.childNodes[i]);
		}
		me._marker_node3.callChildLogicBlocks_configloaded = function(){
			if(me._marker_node3.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node3.ggMarkerInstances.length; i++) {
					if((me._marker_node3.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node3)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node3)<0 && i==0) || (i>1))) {
					if (me._marker_node3.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node3.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node3.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node3.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node3.ggMarkerInstances.length; i++) {
					if((me._marker_node3.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node3)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node3)<0 && i==0) || (i>1))) {
					if (me._marker_node3.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node3.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node3.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node3.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node3.ggMarkerInstances.length; i++) {
					if((me._marker_node3.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node3)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node3)<0 && i==0) || (i>1))) {
					if (me._marker_node3.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node3.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node3.callChildLogicBlocks_hastouch = function(){
			if(me._marker_node3.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node3.ggMarkerInstances.length; i++) {
					if((me._marker_node3.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node3)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node3)<0 && i==0) || (i>1))) {
					if (me._marker_node3.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node3.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node3.callChildLogicBlocks_configloaded();
		me._marker_node3.callChildLogicBlocks_mouseover();
		me._marker_node3.callChildLogicBlocks_mouseover();
		me._marker_node3.callChildLogicBlocks_hastouch();
		var clonedNormalElement = new SkinElement_marker_normal_Class(this,me._marker_node1);
		me._marker_node1__normal = clonedNormalElement._marker_normal;
		me._marker_node1__normal.style.visibility='inherit';
		me._marker_node1__normal.style.left='0px';
		me._marker_node1__normal.style.top='0px';
		me._marker_node1.ggMarkerNormal=me._marker_node1__normal;
		me._marker_node1.ggMarkerInstances.push(clonedNormalElement);
		var clonedActiveElement = new SkinElement_marker_active_Class(this,me._marker_node1);
		me._marker_node1__active= clonedActiveElement._marker_active;
		me._marker_node1__active.style.visibility='hidden';
		me._marker_node1__active.style.left='0px';
		me._marker_node1__active.style.top='0px';
		me._marker_node1.ggMarkerActive=me._marker_node1__active;
		me._marker_node1.ggMarkerInstances.push(clonedActiveElement);
		if (me._marker_node1.firstChild) {
			me._marker_node1.insertBefore(me._marker_node1__active,me._marker_node1.firstChild);
		} else {
			me._marker_node1.appendChild(me._marker_node1__active);
		}
		if (me._marker_node1.firstChild) {
			me._marker_node1.insertBefore(me._marker_node1__normal,me._marker_node1.firstChild);
		} else {
			me._marker_node1.appendChild(me._marker_node1__normal);
		}
		for (var i = 0; i < me._marker_node1.childNodes.length; i++) {
			me._marker_node1.ggMarkerInstances.push(me._marker_node1.childNodes[i]);
		}
		me._marker_node1.callChildLogicBlocks_configloaded = function(){
			if(me._marker_node1.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node1.ggMarkerInstances.length; i++) {
					if((me._marker_node1.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node1)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node1)<0 && i==0) || (i>1))) {
					if (me._marker_node1.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node1.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node1.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node1.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node1.ggMarkerInstances.length; i++) {
					if((me._marker_node1.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node1)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node1)<0 && i==0) || (i>1))) {
					if (me._marker_node1.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node1.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node1.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node1.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node1.ggMarkerInstances.length; i++) {
					if((me._marker_node1.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node1)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node1)<0 && i==0) || (i>1))) {
					if (me._marker_node1.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node1.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node1.callChildLogicBlocks_hastouch = function(){
			if(me._marker_node1.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node1.ggMarkerInstances.length; i++) {
					if((me._marker_node1.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node1)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node1)<0 && i==0) || (i>1))) {
					if (me._marker_node1.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node1.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node1.callChildLogicBlocks_configloaded();
		me._marker_node1.callChildLogicBlocks_mouseover();
		me._marker_node1.callChildLogicBlocks_mouseover();
		me._marker_node1.callChildLogicBlocks_hastouch();
		var clonedNormalElement = new SkinElement_marker_normal_Class(this,me._marker_node2);
		me._marker_node2__normal = clonedNormalElement._marker_normal;
		me._marker_node2__normal.style.visibility='inherit';
		me._marker_node2__normal.style.left='0px';
		me._marker_node2__normal.style.top='0px';
		me._marker_node2.ggMarkerNormal=me._marker_node2__normal;
		me._marker_node2.ggMarkerInstances.push(clonedNormalElement);
		var clonedActiveElement = new SkinElement_marker_active_Class(this,me._marker_node2);
		me._marker_node2__active= clonedActiveElement._marker_active;
		me._marker_node2__active.style.visibility='hidden';
		me._marker_node2__active.style.left='0px';
		me._marker_node2__active.style.top='0px';
		me._marker_node2.ggMarkerActive=me._marker_node2__active;
		me._marker_node2.ggMarkerInstances.push(clonedActiveElement);
		if (me._marker_node2.firstChild) {
			me._marker_node2.insertBefore(me._marker_node2__active,me._marker_node2.firstChild);
		} else {
			me._marker_node2.appendChild(me._marker_node2__active);
		}
		if (me._marker_node2.firstChild) {
			me._marker_node2.insertBefore(me._marker_node2__normal,me._marker_node2.firstChild);
		} else {
			me._marker_node2.appendChild(me._marker_node2__normal);
		}
		for (var i = 0; i < me._marker_node2.childNodes.length; i++) {
			me._marker_node2.ggMarkerInstances.push(me._marker_node2.childNodes[i]);
		}
		me._marker_node2.callChildLogicBlocks_configloaded = function(){
			if(me._marker_node2.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node2.ggMarkerInstances.length; i++) {
					if((me._marker_node2.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node2)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node2)<0 && i==0) || (i>1))) {
					if (me._marker_node2.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node2.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node2.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node2.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node2.ggMarkerInstances.length; i++) {
					if((me._marker_node2.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node2)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node2)<0 && i==0) || (i>1))) {
					if (me._marker_node2.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node2.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node2.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node2.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node2.ggMarkerInstances.length; i++) {
					if((me._marker_node2.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node2)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node2)<0 && i==0) || (i>1))) {
					if (me._marker_node2.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node2.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node2.callChildLogicBlocks_hastouch = function(){
			if(me._marker_node2.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node2.ggMarkerInstances.length; i++) {
					if((me._marker_node2.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node2)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node2)<0 && i==0) || (i>1))) {
					if (me._marker_node2.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node2.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node2.callChildLogicBlocks_configloaded();
		me._marker_node2.callChildLogicBlocks_mouseover();
		me._marker_node2.callChildLogicBlocks_mouseover();
		me._marker_node2.callChildLogicBlocks_hastouch();
		var clonedNormalElement = new SkinElement_marker_normal_Class(this,me._marker_node7);
		me._marker_node7__normal = clonedNormalElement._marker_normal;
		me._marker_node7__normal.style.visibility='inherit';
		me._marker_node7__normal.style.left='0px';
		me._marker_node7__normal.style.top='0px';
		me._marker_node7.ggMarkerNormal=me._marker_node7__normal;
		me._marker_node7.ggMarkerInstances.push(clonedNormalElement);
		var clonedActiveElement = new SkinElement_marker_active_Class(this,me._marker_node7);
		me._marker_node7__active= clonedActiveElement._marker_active;
		me._marker_node7__active.style.visibility='hidden';
		me._marker_node7__active.style.left='0px';
		me._marker_node7__active.style.top='0px';
		me._marker_node7.ggMarkerActive=me._marker_node7__active;
		me._marker_node7.ggMarkerInstances.push(clonedActiveElement);
		if (me._marker_node7.firstChild) {
			me._marker_node7.insertBefore(me._marker_node7__active,me._marker_node7.firstChild);
		} else {
			me._marker_node7.appendChild(me._marker_node7__active);
		}
		if (me._marker_node7.firstChild) {
			me._marker_node7.insertBefore(me._marker_node7__normal,me._marker_node7.firstChild);
		} else {
			me._marker_node7.appendChild(me._marker_node7__normal);
		}
		for (var i = 0; i < me._marker_node7.childNodes.length; i++) {
			me._marker_node7.ggMarkerInstances.push(me._marker_node7.childNodes[i]);
		}
		me._marker_node7.callChildLogicBlocks_configloaded = function(){
			if(me._marker_node7.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node7.ggMarkerInstances.length; i++) {
					if((me._marker_node7.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node7)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node7)<0 && i==0) || (i>1))) {
					if (me._marker_node7.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node7.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node7.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node7.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node7.ggMarkerInstances.length; i++) {
					if((me._marker_node7.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node7)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node7)<0 && i==0) || (i>1))) {
					if (me._marker_node7.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node7.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node7.callChildLogicBlocks_mouseover = function(){
			if(me._marker_node7.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node7.ggMarkerInstances.length; i++) {
					if((me._marker_node7.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node7)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node7)<0 && i==0) || (i>1))) {
					if (me._marker_node7.ggMarkerInstances[i].logicBlock_visible) {
						me._marker_node7.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._marker_node7.callChildLogicBlocks_hastouch = function(){
			if(me._marker_node7.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._marker_node7.ggMarkerInstances.length; i++) {
					if((me._marker_node7.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._marker_node7)>=0 && i==1) || (activeNodeMarker.indexOf(me._marker_node7)<0 && i==0) || (i>1))) {
					if (me._marker_node7.ggMarkerInstances[i].logicBlock_position) {
						me._marker_node7.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._marker_node7.callChildLogicBlocks_configloaded();
		me._marker_node7.callChildLogicBlocks_mouseover();
		me._marker_node7.callChildLogicBlocks_mouseover();
		me._marker_node7.callChildLogicBlocks_hastouch();
		var clonedNormalElement = new SkinElement_marker_normal_Class(this,me._markertemplate);
		me._markertemplate__normal = clonedNormalElement._marker_normal;
		me._markertemplate__normal.style.visibility='inherit';
		me._markertemplate__normal.style.left='0px';
		me._markertemplate__normal.style.top='0px';
		me._markertemplate.ggMarkerNormal=me._markertemplate__normal;
		me._markertemplate.ggMarkerInstances.push(clonedNormalElement);
		var clonedActiveElement = new SkinElement_marker_active_Class(this,me._markertemplate);
		me._markertemplate__active= clonedActiveElement._marker_active;
		me._markertemplate__active.style.visibility='hidden';
		me._markertemplate__active.style.left='0px';
		me._markertemplate__active.style.top='0px';
		me._markertemplate.ggMarkerActive=me._markertemplate__active;
		me._markertemplate.ggMarkerInstances.push(clonedActiveElement);
		if (me._markertemplate.firstChild) {
			me._markertemplate.insertBefore(me._markertemplate__active,me._markertemplate.firstChild);
		} else {
			me._markertemplate.appendChild(me._markertemplate__active);
		}
		if (me._markertemplate.firstChild) {
			me._markertemplate.insertBefore(me._markertemplate__normal,me._markertemplate.firstChild);
		} else {
			me._markertemplate.appendChild(me._markertemplate__normal);
		}
		for (var i = 0; i < me._markertemplate.childNodes.length; i++) {
			me._markertemplate.ggMarkerInstances.push(me._markertemplate.childNodes[i]);
		}
		me._markertemplate.callChildLogicBlocks_configloaded = function(){
			if(me._markertemplate.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._markertemplate.ggMarkerInstances.length; i++) {
					if((me._markertemplate.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._markertemplate)>=0 && i==1) || (activeNodeMarker.indexOf(me._markertemplate)<0 && i==0) || (i>1))) {
					if (me._markertemplate.ggMarkerInstances[i].logicBlock_position) {
						me._markertemplate.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._markertemplate.callChildLogicBlocks_mouseover = function(){
			if(me._markertemplate.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._markertemplate.ggMarkerInstances.length; i++) {
					if((me._markertemplate.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._markertemplate)>=0 && i==1) || (activeNodeMarker.indexOf(me._markertemplate)<0 && i==0) || (i>1))) {
					if (me._markertemplate.ggMarkerInstances[i].logicBlock_visible) {
						me._markertemplate.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._markertemplate.callChildLogicBlocks_mouseover = function(){
			if(me._markertemplate.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._markertemplate.ggMarkerInstances.length; i++) {
					if((me._markertemplate.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._markertemplate)>=0 && i==1) || (activeNodeMarker.indexOf(me._markertemplate)<0 && i==0) || (i>1))) {
					if (me._markertemplate.ggMarkerInstances[i].logicBlock_visible) {
						me._markertemplate.ggMarkerInstances[i].logicBlock_visible();
					}
					}
				}
			}
		}
		me._markertemplate.callChildLogicBlocks_hastouch = function(){
			if(me._markertemplate.ggMarkerInstances) {
				var i;
				for(i = 0; i < me._markertemplate.ggMarkerInstances.length; i++) {
					if((me._markertemplate.ggMarkerInstances[i]) && ((activeNodeMarker.indexOf(me._markertemplate)>=0 && i==1) || (activeNodeMarker.indexOf(me._markertemplate)<0 && i==0) || (i>1))) {
					if (me._markertemplate.ggMarkerInstances[i].logicBlock_position) {
						me._markertemplate.ggMarkerInstances[i].logicBlock_position();
					}
					}
				}
			}
		}
		me._markertemplate.callChildLogicBlocks_configloaded();
		me._markertemplate.callChildLogicBlocks_mouseover();
		me._markertemplate.callChildLogicBlocks_mouseover();
		me._markertemplate.callChildLogicBlocks_hastouch();
		player.setUseGyro(true);
		player.addListener('sizechanged', function() {
			me.updateSize(me.divSkin);
		});
	};
	this.hotspotProxyClick=function(id, url) {
	}
	this.hotspotProxyDoubleClick=function(id, url) {
	}
	me.hotspotProxyOver=function(id, url) {
		if (url=='{node6}') {
			me._marker_title6.onmouseover();
		}
		if (url=='{node5}') {
			me._marker_title5.onmouseover();
		}
		if (url=='{node4}') {
			me._marker_title4.onmouseover();
		}
		if (url=='{node3}') {
			me._marker_title3.onmouseover();
		}
		if (url=='{node1}') {
			me._marker_title2.onmouseover();
		}
		if (url=='{node2}') {
			me._marker_title1.onmouseover();
		}
		if (url=='{node7}') {
			me._marker_title0.onmouseover();
		}
		if (url=='{}') {
			me._marker_title.onmouseover();
		}
	}
	me.hotspotProxyOut=function(id, url) {
		if (url=='{node6}') {
			me._marker_title6.onmouseout();
		}
		if (url=='{node5}') {
			me._marker_title5.onmouseout();
		}
		if (url=='{node4}') {
			me._marker_title4.onmouseout();
		}
		if (url=='{node3}') {
			me._marker_title3.onmouseout();
		}
		if (url=='{node1}') {
			me._marker_title2.onmouseout();
		}
		if (url=='{node2}') {
			me._marker_title1.onmouseout();
		}
		if (url=='{node7}') {
			me._marker_title0.onmouseout();
		}
		if (url=='{}') {
			me._marker_title.onmouseout();
		}
	}
	me.callChildLogicBlocksHotspot_ht_node_sizechanged = function(){
		if(hotspotTemplates['ht_node']) {
			var i;
			for(i = 0; i < hotspotTemplates['ht_node'].length; i++) {
				if (hotspotTemplates['ht_node'][i]._ht_node.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_node.logicBlock_visible();
				}
			}
		}
	}
	me.callChildLogicBlocksHotspot_ht_node_changenode = function(){
		if(hotspotTemplates['ht_node']) {
			var i;
			for(i = 0; i < hotspotTemplates['ht_node'].length; i++) {
				if (hotspotTemplates['ht_node'][i]._ht_node.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_node.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._ht_node_visited && hotspotTemplates['ht_node'][i]._ht_node_visited.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_node_visited.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._ht_node_image && hotspotTemplates['ht_node'][i]._ht_node_image.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_node_image.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._hotspot_preview && hotspotTemplates['ht_node'][i]._hotspot_preview.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._hotspot_preview.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._tt_ht_node && hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._ht_node_customimage && hotspotTemplates['ht_node'][i]._ht_node_customimage.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_node_customimage.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._ht_tooltip && hotspotTemplates['ht_node'][i]._ht_tooltip.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_tooltip.logicBlock_visible();
				}
			}
		}
	}
	me.callChildLogicBlocksHotspot_ht_node_configloaded = function(){
		if(hotspotTemplates['ht_node']) {
			var i;
			for(i = 0; i < hotspotTemplates['ht_node'].length; i++) {
				if (hotspotTemplates['ht_node'][i]._hotspot_preview && hotspotTemplates['ht_node'][i]._hotspot_preview.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._hotspot_preview.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._tt_ht_node && hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_position) {
					hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_position();
				}
				if (hotspotTemplates['ht_node'][i]._tt_ht_node && hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_visible();
				}
			}
		}
	}
	me.callChildLogicBlocksHotspot_ht_node_mouseover = function(){
		if(hotspotTemplates['ht_node']) {
			var i;
			for(i = 0; i < hotspotTemplates['ht_node'].length; i++) {
				if (hotspotTemplates['ht_node'][i]._hotspot_preview && hotspotTemplates['ht_node'][i]._hotspot_preview.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._hotspot_preview.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._tt_ht_node && hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_visible();
				}
			}
		}
	}
	me.callChildLogicBlocksHotspot_ht_node_active = function(){
		if(hotspotTemplates['ht_node']) {
			var i;
			for(i = 0; i < hotspotTemplates['ht_node'].length; i++) {
				if (hotspotTemplates['ht_node'][i]._ht_checkmark_tick && hotspotTemplates['ht_node'][i]._ht_checkmark_tick.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_checkmark_tick.logicBlock_visible();
				}
			}
		}
	}
	me.callChildLogicBlocksHotspot_ht_node_changevisitednodes = function(){
		if(hotspotTemplates['ht_node']) {
			var i;
			for(i = 0; i < hotspotTemplates['ht_node'].length; i++) {
				if (hotspotTemplates['ht_node'][i]._ht_node_visited && hotspotTemplates['ht_node'][i]._ht_node_visited.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_node_visited.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._ht_node_image && hotspotTemplates['ht_node'][i]._ht_node_image.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_node_image.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._ht_checkmark_tick && hotspotTemplates['ht_node'][i]._ht_checkmark_tick.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_checkmark_tick.logicBlock_visible();
				}
			}
		}
	}
	me.callChildLogicBlocksHotspot_ht_node_hastouch = function(){
		if(hotspotTemplates['ht_node']) {
			var i;
			for(i = 0; i < hotspotTemplates['ht_node'].length; i++) {
				if (hotspotTemplates['ht_node'][i]._tt_ht_node && hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_position) {
					hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_position();
				}
			}
		}
	}
	me.callChildLogicBlocksHotspot_ht_node_activehotspotchanged = function(){
		if(hotspotTemplates['ht_node']) {
			var i;
			for(i = 0; i < hotspotTemplates['ht_node'].length; i++) {
				if (hotspotTemplates['ht_node'][i]._ht_node_visited && hotspotTemplates['ht_node'][i]._ht_node_visited.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_node_visited.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._ht_node_image && hotspotTemplates['ht_node'][i]._ht_node_image.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_node_image.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._tt_ht_node && hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._ht_node_customimage && hotspotTemplates['ht_node'][i]._ht_node_customimage.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_node_customimage.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._ht_tooltip && hotspotTemplates['ht_node'][i]._ht_tooltip.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._ht_tooltip.logicBlock_visible();
				}
			}
		}
	}
	me.callChildLogicBlocksHotspot_ht_node_varchanged_opt_hotspot_preview = function(){
		if(hotspotTemplates['ht_node']) {
			var i;
			for(i = 0; i < hotspotTemplates['ht_node'].length; i++) {
				if (hotspotTemplates['ht_node'][i]._hotspot_preview && hotspotTemplates['ht_node'][i]._hotspot_preview.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._hotspot_preview.logicBlock_visible();
				}
				if (hotspotTemplates['ht_node'][i]._tt_ht_node && hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_visible) {
					hotspotTemplates['ht_node'][i]._tt_ht_node.logicBlock_visible();
				}
			}
		}
	}
	player.addListener('changenode', function() {
		me.ggUserdata=player.userdata;
		var newMarker=[];
		var id=player.getCurrentNode();
		var i,j;
		var tags=me.ggUserdata.tags;
		for (i=0;i<nodeMarker.length;i++) {
			var match=false;
			if ((nodeMarker[i].ggMarkerNodeId.length > 0) && (nodeMarker[i].ggMarkerNodeId.charAt(0)=='{') && (nodeMarker[i].ggMarkerNodeId.substr(1, nodeMarker[i].ggMarkerNodeId.length - 2)==id) && (id!='')) match=true;  // }
			for(j=0;j<tags.length;j++) {
				if (nodeMarker[i].ggMarkerNodeId==tags[j]) match=true;
			}
			if (match) {
				newMarker.push(nodeMarker[i]);
			}
		}
		for(i=0;i<activeNodeMarker.length;i++) {
			if (newMarker.indexOf(activeNodeMarker[i])<0) {
				if (activeNodeMarker[i].ggMarkerNormal) {
					activeNodeMarker[i].ggMarkerNormal.style.visibility='inherit';
				}
				if (activeNodeMarker[i].ggMarkerActive) {
					activeNodeMarker[i].ggMarkerActive.style.visibility='hidden';
				}
				if (activeNodeMarker[i].ggDeactivate) {
					activeNodeMarker[i].ggDeactivate();
				}
				activeNodeMarker[i].ggIsMarkerActive=false;
			}
		}
		for(i=0;i<newMarker.length;i++) {
			if (activeNodeMarker.indexOf(newMarker[i])<0) {
				if (newMarker[i].ggMarkerNormal) {
					newMarker[i].ggMarkerNormal.style.visibility='hidden';
				}
				if (newMarker[i].ggMarkerActive) {
					newMarker[i].ggMarkerActive.style.visibility='inherit';
				}
				if (newMarker[i].ggActivate) {
					newMarker[i].ggActivate();
				}
				newMarker[i].ggIsMarkerActive=true;
			}
		}
		activeNodeMarker=newMarker;
	});
	me.skinTimerEvent=function() {
		me.ggCurrentTime=new Date().getTime();
		if (me.elementMouseDown['button_image_right']) {
			player.changePanLog(-0.5,true);
		}
		if (me.elementMouseDown['button_image_left']) {
			player.changePanLog(0.5,true);
		}
		if (me.elementMouseDown['button_image_down']) {
			player.changeTiltLog(-0.5,true);
		}
		if (me.elementMouseDown['button_image_up']) {
			player.changeTiltLog(0.5,true);
		}
		if (!player.getLockedKeyboard()) {
			switch(me.skinKeyPressed) {
				case 37:
					player.changePanLog(0.5,true);
					break;
				case 38:
					player.changeTiltLog(0.5,true);
					break;
				case 39:
					player.changePanLog(-0.5,true);
					break;
				case 40:
					player.changeTiltLog(-0.5,true);
					break;
			}
		}
	};
	player.addListener('timer', me.skinTimerEvent);
	function SkinHotspotClass_ht_node(parentScope,hotspot) {
		var me=this;
		var flag=false;
		var hs='';
		me.parentScope=parentScope;
		me.hotspot=hotspot;
		var nodeId=String(hotspot.url);
		nodeId=(nodeId.charAt(0)=='{')?nodeId.substr(1, nodeId.length - 2):''; // }
		me.ggUserdata=skin.player.getNodeUserdata(nodeId);
		me.elementMouseDown=[];
		me.elementMouseOver=[];
		me.findElements=function(id,regex) {
			return skin.findElements(id,regex);
		}
		el=me._ht_node=document.createElement('div');
		el.ggId="ht_node";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_hotspot ";
		el.ggType='hotspot';
		hs ='';
		hs+='height : 0px;';
		hs+='left : 75px;';
		hs+='position : absolute;';
		hs+='top : 130px;';
		hs+='visibility : inherit;';
		hs+='width : 0px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._ht_node.ggIsActive=function() {
			return player.getCurrentNode()==this.ggElementNodeId();
		}
		el.ggElementNodeId=function() {
			if (me.hotspot.url!='' && me.hotspot.url.charAt(0)=='{') { // }
				return me.hotspot.url.substr(1, me.hotspot.url.length - 2);
			} else {
				if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
					return this.parentNode.ggElementNodeId();
				} else {
					return player.getCurrentNode();
				}
			}
		}
		me._ht_node.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((player.getVariableValue('vis_userdata') == true)) || 
				((player.getVariableValue('vis_image_popup') == true)) || 
				((player.getVariableValue('vis_info_popup') == true)) || 
				((player.getVariableValue('vis_video_popup_file') == true)) || 
				((player.getVariableValue('vis_video_popup_url') == true)) || 
				((player.getVariableValue('vis_video_popup_vimeo') == true)) || 
				((player.getVariableValue('vis_video_popup_youtube') == true)) || 
				((player.getVariableValue('vis_website') == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._ht_node.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._ht_node.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._ht_node.style[domTransition]='';
				if (me._ht_node.ggCurrentLogicStateVisible == 0) {
					me._ht_node.style.visibility="hidden";
					me._ht_node.ggVisible=false;
				}
				else {
					me._ht_node.style.visibility=(Number(me._ht_node.style.opacity)>0||!me._ht_node.style.opacity)?'inherit':'hidden';
					me._ht_node.ggVisible=true;
				}
			}
		}
		me._ht_node.onclick=function (e) {
			player.openNext(me.hotspot.url,me.hotspot.target);
			skin.hotspotProxyClick(me.hotspot.id, me.hotspot.url);
		}
		me._ht_node.ondblclick=function (e) {
			skin.hotspotProxyDoubleClick(me.hotspot.id, me.hotspot.url);
		}
		me._ht_node.onmouseover=function (e) {
			player.setActiveHotspot(me.hotspot);
			me.elementMouseOver['ht_node']=true;
			me._hotspot_preview.logicBlock_visible();
			me._tt_ht_node.logicBlock_visible();
			skin.hotspotProxyOver(me.hotspot.id, me.hotspot.url);
		}
		me._ht_node.onmouseout=function (e) {
			player.setActiveHotspot(null);
			me.elementMouseOver['ht_node']=false;
			me._hotspot_preview.logicBlock_visible();
			me._tt_ht_node.logicBlock_visible();
			skin.hotspotProxyOut(me.hotspot.id, me.hotspot.url);
		}
		me._ht_node.ontouchend=function (e) {
			me.elementMouseOver['ht_node']=false;
			me._hotspot_preview.logicBlock_visible();
			me._tt_ht_node.logicBlock_visible();
		}
		me._ht_node.ggUpdatePosition=function (useTransition) {
		}
		el=me._ht_node_visited=document.createElement('div');
		els=me._ht_node_visited__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0xNzUsMzQxYy0zMSwwLTU2LjEsMjUuMS01Ni4xLDU2LjFjMCwzMSwyNS4xLDU2LjEsNTYuMSw1Ni4xczU2LjEtMjUuMSw1Ni4xLTU2LjEmI3hkOyYjeGE7JiN4OTsmI3g5O0MtMTE4LjksMzY2LjEtMTQ0LDM0MS0xNzUsMzQxeiBNLTE2Ny45LDM2Ni42YzAuNS0wLjUsMS40LTAuNSwyLDBsMS4yLDEuMmMwLjUsMC41LDAuNSwxLjQsMCwybC0yNS4zLDI1LjNjLTAuNSwwLjUtMS43LDEuNS0yLDEuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0wLjMsMC4xLTAuOCwwLjEtMS4xLDBjLTAuMy0wLjEtMS40LTEtMi0xLjVsLTcuOC03Ljhj'+
			'LTAuNS0wLjUtMC41LTEuNCwwLTJsMS4yLTEuMmMwLjUtMC41LDEuNC0wLjUsMiwwbDcuMiw3LjJMLTE2Ny45LDM2Ni42eiYjeGQ7JiN4YTsmI3g5OyYjeDk7IE0tMTU0LjksMzk0YzAuMy0wLjMsMC42LTAuNCwxLTAuNGMwLjQsMCwwLjcsMC4xLDEsMC40bDguNyw4LjV2MTEuNGMtNy42LTIuNy0xNi43LTQuMy0yNi4zLTQuN0wtMTU0LjksMzk0eiBNLTE1NC42LDM4MyYjeGQ7JiN4YTsmI3g5OyYjeDk7YzIuMy0wLjQsNC40LDAuNiw0LjcsMi4zYzAuMywxLjctMS4zLDMuNC0zLjUsMy45Yy0yLjMsMC40LTQuNC0wLjYtNC43LTIuM0MtMTU4LjQsMzg1LjItMTU2LjksMzgzLjUtMTU0LjYsMzgzei'+
			'BNLTE3Myw0MDkuMiYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0wLjcsMC0xLjMsMC0yLDBjLTExLjEsMC0yMiwxLjctMzAuOCw0Ljh2LTYuN2M4LjUtMS40LDE5LjQtMi4zLDMwLjgtMi4zYzIuMSwwLDQuMSwwLDYuMiwwLjFMLTE3Myw0MDkuMnogTS0xNjcsNDAzLjQmI3hkOyYjeGE7JiN4OTsmI3g5O2MtMi42LTAuMS01LjMtMC4xLTgtMC4xYy01LjQsMC0xMC43LDAuMi0xNS43LDAuNWwxNC4yLTEzLjljMC45LTAuOSwyLjQtMC45LDMuMywwbDEwLDkuN0wtMTY3LDQwMy40eiBNLTEzNy45LDQyMCYjeGQ7JiN4YTsmI3g5OyYjeDk7YzAsMC44LTAuNCwxLjUtMS4xLDEuOWMtMC43LDAuNC0xLjUsMC41'+
			'LTIuMiwwLjFjLTguNy00LjItMjEtNi42LTMzLjgtNi42cy0yNS4yLDIuNC0zMy44LDYuNmMtMC4zLDAuMi0wLjYsMC4yLTEsMC4yJiN4ZDsmI3hhOyYjeDk7JiN4OTtjLTAuNCwwLTAuOC0wLjEtMS4yLTAuM2MtMC43LTAuNC0xLjEtMS4xLTEuMS0xLjl2LTQ1LjhjMC0wLjgsMC40LTEuNSwxLjEtMS45YzAuNy0wLjQsMS41LTAuNSwyLjItMC4xYzcsMy40LDE2LjQsNS42LDI2LjUsNi4zJiN4ZDsmI3hhOyYjeDk7JiN4OTtsLTQuMSw0LjFjLTcuOC0wLjktMTUuMS0yLjYtMjEuMS01djM4LjljOC45LTMuNiwyMC42LTUuNiwzMi42LTUuNmMxMiwwLDIzLjYsMiwzMi42LDUuNnYtMzguOWMtOC45LD'+
			'MuNi0yMC42LDUuNi0zMi42LDUuNiYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0wLjIsMC0wLjUsMC0wLjcsMGw0LjYtNC42YzExLjQtMC40LDIyLjItMi43LDMwLTYuNWMwLjctMC4zLDEuNS0wLjMsMi4yLDAuMWMwLjcsMC40LDEuMSwxLjEsMS4xLDEuOUwtMTM3LjksNDIwTC0xMzcuOSw0MjB6Ii8+CiA8L2c+CiA8ZyBpZD0iTGF5ZXJfMiI+CiAgPGc+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTc2LjUsMzg5LjlsLTE0LjIsMTMuOWM1LTAuMywxMC4zLTAuNSwxNS43LTAuNWMyLjcsMCw1LjMsMCw4LDAuMWwzLjgtMy43bC0xMC05LjcmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Qy0xNzQu'+
			'MSwzODktMTc1LjYsMzg5LTE3Ni41LDM4OS45eiIvPgogICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNLTIwNS44LDQwNy4zdjYuN2M4LjgtMy4xLDE5LjYtNC44LDMwLjgtNC44YzAuNywwLDEuMywwLDIsMGw0LjItNC4xYy0yLTAuMS00LjEtMC4xLTYuMi0wLjEmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Qy0xODYuMyw0MDUtMTk3LjMsNDA1LjgtMjA1LjgsNDA3LjN6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTQ0LjIsNDEzLjl2LTExLjRsLTguNy04LjVjLTAuMy0wLjMtMC42LTAuNC0xLTAuNGMtMC40LDAtMC43LDAuMS0xLDAuNGwtMTUuNiwxNS4yJiN4ZDsmI3hhOyYjeD'+
			'k7JiN4OTsmI3g5O0MtMTYwLjksNDA5LjYtMTUxLjgsNDExLjMtMTQ0LjIsNDEzLjl6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTUzLjQsMzg5LjJjMi4zLTAuNCwzLjktMi4yLDMuNS0zLjljLTAuMy0xLjctMi40LTIuNy00LjctMi4zYy0yLjMsMC40LTMuOSwyLjItMy41LDMuOSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtDLTE1Ny44LDM4OC42LTE1NS43LDM4OS42LTE1My40LDM4OS4yeiIvPgogICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNLTE5OS44LDM4NC4yYy0wLjUtMC41LTEuNC0wLjUtMiwwbC0xLjIsMS4yYy0wLjUsMC41LTAuNSwxLjQsMCwybDcuOCw3LjhjMC41'+
			'LDAuNSwxLjcsMS41LDIsMS41JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MwLjMsMC4xLDAuOCwwLjEsMS4xLDBjMC4zLTAuMSwxLjQtMSwyLTEuNWwyNS4zLTI1LjNjMC41LTAuNSwwLjUtMS40LDAtMmwtMS4yLTEuMmMtMC41LTAuNS0xLjQtMC41LTIsMGwtMjQuNywyNC43JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0wtMTk5LjgsMzg0LjJ6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTM5LDM3Mi4zYy0wLjctMC40LTEuNS0wLjUtMi4yLTAuMWMtNy44LDMuOC0xOC42LDYuMS0zMCw2LjVsLTQuNiw0LjZjMC4yLDAsMC41LDAsMC43LDAmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeD'+
			'k7YzEyLDAsMjMuNi0yLDMyLjYtNS42djM4LjljLTguOS0zLjYtMjAuNi01LjYtMzIuNi01LjZzLTIzLjYsMi0zMi42LDUuNnYtMzguOWM2LDIuNCwxMy4zLDQuMSwyMS4xLDVsNC4xLTQuMSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLTEwLjEtMC43LTE5LjUtMi45LTI2LjUtNi4zYy0wLjctMC4zLTEuNS0wLjMtMi4yLDAuMWMtMC43LDAuNC0xLjEsMS4xLTEuMSwxLjlWNDIwYzAsMC44LDAuNCwxLjUsMS4xLDEuOSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC40LDAuMiwwLjgsMC4zLDEuMiwwLjNjMC4zLDAsMC43LTAuMSwxLTAuMmM4LjctNC4yLDIxLTYuNiwzMy44LTYuNmMxMi44LDAs'+
			'MjUuMiwyLjQsMzMuOCw2LjZjMC43LDAuMywxLjUsMC4zLDIuMi0wLjEmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzAuNy0wLjQsMS4xLTEuMSwxLjEtMS45di00NS44Qy0xMzcuOSwzNzMuNC0xMzguMywzNzIuNy0xMzksMzcyLjN6Ii8+CiAgPC9nPgogPC9nPgo8L3N2Zz4K';
		me._ht_node_visited__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		elo=me._ht_node_visited__imgo=document.createElement('img');
		elo.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0xNzUsMzM0LjdjLTM0LjQsMC02Mi40LDI3LjktNjIuNCw2Mi40YzAsMzQuNCwyNy45LDYyLjQsNjIuNCw2Mi40czYyLjQtMjcuOSw2Mi40LTYyLjQmI3hkOyYjeGE7JiN4OTsmI3g5O0MtMTEyLjYsMzYyLjctMTQwLjYsMzM0LjctMTc1LDMzNC43eiBNLTE2Ny4xLDM2My4yYzAuNi0wLjYsMS42LTAuNiwyLjIsMGwxLjMsMS4zYzAuNiwwLjYsMC42LDEuNiwwLDIuMmwtMjguMiwyOC4yJiN4ZDsmI3hhOyYjeDk7JiN4OTtjLTAuNiwwLjYtMS45LDEuNi0yLjIsMS43Yy0wLjMsMC4xLTAuOSwwLjEtMS4zLDBjLTAuMy0wLjEtMS42'+
			'LTEuMS0yLjItMS43bC04LjYtOC42Yy0wLjYtMC42LTAuNi0xLjYsMC0yLjJsMS4zLTEuMyYjeGQ7JiN4YTsmI3g5OyYjeDk7YzAuNi0wLjYsMS42LTAuNiwyLjIsMGw4LDhMLTE2Ny4xLDM2My4yeiBNLTE1Mi43LDM5My43YzAuMy0wLjMsMC43LTAuNSwxLjEtMC41czAuOCwwLjIsMS4xLDAuNGw5LjYsOS40djEyLjcmI3hkOyYjeGE7JiN4OTsmI3g5O2MtOC40LTMtMTguNi00LjgtMjkuMi01LjJMLTE1Mi43LDM5My43eiBNLTE1Mi4zLDM4MS41YzIuNS0wLjUsNC45LDAuNiw1LjMsMi41YzAuNCwxLjktMS40LDMuOC0zLjksNC4zYy0yLjUsMC41LTQuOS0wLjYtNS4zLTIuNSYjeGQ7JiN4YTsmI3'+
			'g5OyYjeDk7Qy0xNTYuNiwzODMuOS0xNTQuOCwzODItMTUyLjMsMzgxLjV6IE0tMTcyLjgsNDEwLjVjLTAuNywwLTEuNSwwLTIuMiwwYy0xMi40LDAtMjQuNSwxLjktMzQuMiw1LjN2LTcuNGM5LjQtMS42LDIxLjYtMi41LDM0LjItMi41JiN4ZDsmI3hhOyYjeDk7JiN4OTtjMi4zLDAsNC42LDAsNi45LDAuMUwtMTcyLjgsNDEwLjV6IE0tMTY2LjIsNDA0LjFjLTIuOS0wLjEtNS45LTAuMi04LjgtMC4yYy02LDAtMTEuOCwwLjItMTcuNCwwLjZsMTUuOC0xNS40YzEtMSwyLjYtMSwzLjcsMCYjeGQ7JiN4YTsmI3g5OyYjeDk7bDExLjEsMTAuOEwtMTY2LjIsNDA0LjF6IE0tMTMzLjgsNDIyLjVjMCww'+
			'LjktMC40LDEuNy0xLjIsMi4xYy0wLjcsMC41LTEuNiwwLjUtMi40LDAuMWMtOS42LTQuNi0yMy4zLTcuMy0zNy42LTcuMyYjeGQ7JiN4YTsmI3g5OyYjeDk7cy0yOCwyLjctMzcuNiw3LjNjLTAuMywwLjItMC43LDAuMi0xLjEsMC4yYy0wLjUsMC0wLjktMC4xLTEuMy0wLjRjLTAuNy0wLjUtMS4yLTEuMy0xLjItMi4xdi01MC45YzAtMC45LDAuNC0xLjcsMS4yLTIuMSYjeGQ7JiN4YTsmI3g5OyYjeDk7YzAuNy0wLjUsMS42LTAuNSwyLjQtMC4xYzcuOCwzLjgsMTguMiw2LjIsMjkuNCw3bC00LjYsNC42Yy04LjYtMC45LTE2LjctMi44LTIzLjQtNS41djQzLjJjOS45LTQsMjIuOS02LjIsMzYuMi'+
			'02LjImI3hkOyYjeGE7JiN4OTsmI3g5O3MyNi4zLDIuMiwzNi4yLDYuMnYtNDMuMmMtOS45LDQtMjIuOSw2LjItMzYuMiw2LjJjLTAuMywwLTAuNSwwLTAuOCwwbDUuMS01LjFjMTIuNy0wLjUsMjQuNy0zLDMzLjMtNy4yYzAuOC0wLjQsMS43LTAuMywyLjQsMC4xJiN4ZDsmI3hhOyYjeDk7JiN4OTtjMC43LDAuNSwxLjIsMS4zLDEuMiwyLjFMLTEzMy44LDQyMi41TC0xMzMuOCw0MjIuNXoiLz4KIDwvZz4KIDxnIGlkPSJMYXllcl8yIj4KICA8Zz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTS0xNzYuNiwzODkuMWwtMTUuOCwxNS40YzUuNi0wLjQsMTEuNC0wLjYsMTcuNC0wLjZjMywwLDUu'+
			'OSwwLjEsOC44LDAuMmw0LjItNC4xbC0xMS4xLTEwLjgmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Qy0xNzQsMzg4LjEtMTc1LjYsMzg4LjEtMTc2LjYsMzg5LjF6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMjA5LjIsNDA4LjR2Ny40YzkuNy0zLjQsMjEuOC01LjMsMzQuMi01LjNjMC43LDAsMS41LDAsMi4yLDBsNC42LTQuNWMtMi4zLTAuMS00LjYtMC4xLTYuOS0wLjEmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Qy0xODcuNiw0MDUuOS0xOTkuNyw0MDYuOC0yMDkuMiw0MDguNHoiLz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTS0xNDAuOCw0MTUuOHYtMTIuN2wtOS42LT'+
			'kuNGMtMC4zLTAuMy0wLjctMC40LTEuMS0wLjRjLTAuNCwwLTAuOCwwLjItMS4xLDAuNWwtMTcuMywxNi45JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0MtMTU5LjQsNDExLTE0OS4yLDQxMi45LTE0MC44LDQxNS44eiIvPgogICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNLTE1MSwzODguM2MyLjUtMC41LDQuMy0yLjQsMy45LTQuM2MtMC40LTEuOS0yLjctMy01LjMtMi41Yy0yLjUsMC41LTQuMywyLjQtMy45LDQuMyYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtDLTE1NS45LDM4Ny43LTE1My41LDM4OC44LTE1MSwzODguM3oiLz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTS0yMDIuNiwz'+
			'ODIuN2MtMC42LTAuNi0xLjYtMC42LTIuMiwwbC0xLjMsMS4zYy0wLjYsMC42LTAuNiwxLjYsMCwyLjJsOC42LDguNmMwLjYsMC42LDEuOSwxLjYsMi4yLDEuNyYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC4zLDAuMSwwLjksMC4xLDEuMywwYzAuMy0wLjEsMS42LTEuMSwyLjItMS43bDI4LjItMjguMmMwLjYtMC42LDAuNi0xLjYsMC0yLjJsLTEuMy0xLjNjLTAuNi0wLjYtMS42LTAuNi0yLjIsMGwtMjcuNSwyNy41JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0wtMjAyLjYsMzgyLjd6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTM1LDM2OS41Yy0wLjctMC41LTEuNi0wLjUtMi'+
			'40LTAuMWMtOC43LDQuMi0yMC42LDYuNy0zMy4zLDcuMmwtNS4xLDUuMWMwLjMsMCwwLjUsMCwwLjgsMCYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMTMuMywwLDI2LjMtMi4yLDM2LjItNi4ydjQzLjJjLTkuOS00LTIyLjktNi4yLTM2LjItNi4ycy0yNi4zLDIuMi0zNi4yLDYuMnYtNDMuMmM2LjcsMi43LDE0LjgsNC42LDIzLjQsNS41bDQuNi00LjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0xMS4yLTAuOC0yMS43LTMuMy0yOS40LTdjLTAuOC0wLjQtMS43LTAuMy0yLjQsMC4xYy0wLjcsMC41LTEuMiwxLjMtMS4yLDIuMXY1MC45YzAsMC45LDAuNCwxLjcsMS4yLDIuMSYjeGQ7JiN4YTsm'+
			'I3g5OyYjeDk7JiN4OTtjMC40LDAuMywwLjksMC40LDEuMywwLjRjMC40LDAsMC43LTAuMSwxLjEtMC4yYzkuNi00LjYsMjMuMy03LjMsMzcuNi03LjNjMTQuMywwLDI4LDIuNywzNy42LDcuM2MwLjgsMC40LDEuNywwLjMsMi40LTAuMSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtzMS4yLTEuMywxLjItMi4xdi01MC45Qy0xMzMuOCwzNzAuOC0xMzQuMywzNzAtMTM1LDM2OS41eiIvPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg==';
		me._ht_node_visited__imgo.setAttribute('src',hs);
		elo.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;visibility:hidden;pointer-events:none;;');
		elo['ondragstart']=function() { return false; };
		el.appendChild(elo);
		el.ggId="ht_node_visited";
		el.ggDx=0;
		el.ggDy=0;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : -10000px;';
		hs+='visibility : hidden;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._ht_node_visited.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return me.ggNodeId;
		}
		me._ht_node_visited.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((player.nodeVisited(me._ht_node_visited.ggElementNodeId()) == true)) && 
				((me.hotspot.customimage == ""))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._ht_node_visited.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._ht_node_visited.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._ht_node_visited.style[domTransition]='';
				if (me._ht_node_visited.ggCurrentLogicStateVisible == 0) {
					me._ht_node_visited.style.visibility=(Number(me._ht_node_visited.style.opacity)>0||!me._ht_node_visited.style.opacity)?'inherit':'hidden';
					me._ht_node_visited.ggVisible=true;
				}
				else {
					me._ht_node_visited.style.visibility="hidden";
					me._ht_node_visited.ggVisible=false;
				}
			}
		}
		me._ht_node_visited.onmouseover=function (e) {
			me._ht_node_visited__img.style.visibility='hidden';
			me._ht_node_visited__imgo.style.visibility='inherit';
		}
		me._ht_node_visited.onmouseout=function (e) {
			me._ht_node_visited__img.style.visibility='inherit';
			me._ht_node_visited__imgo.style.visibility='hidden';
		}
		me._ht_node_visited.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
				var ph=this.parentNode.clientHeight;
				var h=this.offsetHeight;
					this.style.top=(this.ggDy + ph/2 - h/2) + 'px';
			}
		}
		me._ht_node.appendChild(me._ht_node_visited);
		el=me._ht_node_image=document.createElement('div');
		els=me._ht_node_image__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPGc+CiAgIDxwYXRoIGZpbGw9IiMwMDAwMDAiIGQ9Ik0tMTc1LDM0MWMtMzEsMC01Ni4xLDI1LjEtNTYuMSw1Ni4xYzAsMzEsMjUuMSw1Ni4xLDU2LjEsNTYuMXM1Ni4xLTI1LjEsNTYuMS01Ni4xJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0MtMTE4LjksMzY2LjEtMTQ0LDM0MS0xNzUsMzQxeiBNLTEzNy45LDQyMGMwLDAuOC0wLjQsMS41LTEuMSwxLjljLTAuNywwLjQtMS41LDAuNS0yLjIsMC4xYy04LjctNC4yLTIxLTYuNi0zMy44LTYuNiYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjLTEyLjgsMC0yNS4yLDIuNC0zMy44LDYuNmMtMC4zLDAuMi0wLjYsMC4yLTEsMC4y'+
			'Yy0wLjQsMC0wLjgtMC4xLTEuMi0wLjNjLTAuNy0wLjQtMS4xLTEuMS0xLjEtMS45di00NS44YzAtMC44LDAuNC0xLjUsMS4xLTEuOSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC43LTAuNCwxLjUtMC41LDIuMi0wLjFjOC43LDQuMiwyMSw2LjYsMzMuOCw2LjZjMTIuOCwwLDI1LjItMi40LDMzLjgtNi42YzAuNy0wLjMsMS41LTAuMywyLjIsMC4xYzAuNywwLjQsMS4xLDEuMSwxLjEsMS45JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0MtMTM3LjksMzc0LjItMTM3LjksNDIwLTEzNy45LDQyMHoiLz4KICAgPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTS0yMDcuNiwzNzcuN3YzOC45YzguOS0zLj'+
			'YsMjAuNi01LjYsMzIuNi01LjZjMTIsMCwyMy42LDIsMzIuNiw1LjZ2LTM4LjljLTguOSwzLjYtMjAuNiw1LjYtMzIuNiw1LjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Qy0xODcsMzgzLjMtMTk4LjYsMzgxLjItMjA3LjYsMzc3Ljd6IE0tMTc1LDQwOS4xYy0xMS4xLDAtMjIsMS43LTMwLjgsNC44di02LjdjOC41LTEuNCwxOS40LTIuMywzMC44LTIuM2MyLjEsMCw0LjEsMCw2LjIsMC4xJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2wtNC4yLDQuMUMtMTczLjcsNDA5LjItMTc0LjMsNDA5LjEtMTc1LDQwOS4xeiBNLTE0NC4yLDQxMy45Yy03LjYtMi43LTE2LjctNC4zLTI2LjMtNC43bDE1LjYt'+
			'MTUuMmMwLjMtMC4zLDAuNi0wLjQsMS0wLjQmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzAuNCwwLDAuNywwLjEsMSwwLjRsOC43LDguNUMtMTQ0LjIsNDAyLjUtMTQ0LjIsNDEzLjktMTQ0LjIsNDEzLjl6IE0tMTU0LjYsMzgzYzIuMy0wLjQsNC40LDAuNiw0LjcsMi4zJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MwLjMsMS43LTEuMywzLjQtMy41LDMuOWMtMi4zLDAuNC00LjQtMC42LTQuNy0yLjNDLTE1OC40LDM4NS4yLTE1Ni45LDM4My41LTE1NC42LDM4M3ogTS0xNzMuMiwzODkuOWwxMCw5LjdsLTMuOCwzLjcmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0yLjYtMC4xLTUuMy0wLjEtOC'+
			'0wLjFjLTUuNCwwLTEwLjcsMC4yLTE1LjcsMC41bDE0LjItMTMuOUMtMTc1LjYsMzg5LTE3NC4xLDM4OS0xNzMuMiwzODkuOXoiLz4KICA8L2c+CiA8L2c+CiA8ZyBpZD0iTGF5ZXJfMiI+CiAgPGc+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTkwLjcsNDAzLjhjNS0wLjMsMTAuMy0wLjUsMTUuNy0wLjVjMi43LDAsNS4zLDAsOCwwLjFsMy44LTMuN2wtMTAtOS43Yy0wLjktMC45LTIuNC0wLjktMy4zLDAmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7TC0xOTAuNyw0MDMuOHoiLz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTS0xNzUsNDA1Yy0xMS4zLDAtMjIuMywwLjgtMzAuOCwy'+
			'LjN2Ni43YzguOC0zLjEsMTkuNi00LjgsMzAuOC00LjhjMC43LDAsMS4zLDAsMiwwbDQuMi00LjEmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Qy0xNzAuOSw0MDUtMTcyLjksNDA1LTE3NSw0MDV6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTUzLjksMzkzLjZjLTAuNCwwLTAuNywwLjEtMSwwLjRsLTE1LjYsMTUuMmM5LjUsMC40LDE4LjcsMiwyNi4zLDQuN3YtMTEuNGwtOC43LTguNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtDLTE1My4yLDM5My44LTE1My41LDM5My42LTE1My45LDM5My42eiIvPgogICA8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNLTEzOSwzNzIuM2MtMC43LT'+
			'AuNC0xLjUtMC41LTIuMi0wLjFjLTguNyw0LjItMjEsNi42LTMzLjgsNi42Yy0xMi45LDAtMjUuMi0yLjQtMzMuOC02LjYmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0wLjctMC4zLTEuNS0wLjMtMi4yLDAuMWMtMC43LDAuNC0xLjEsMS4xLTEuMSwxLjlWNDIwYzAsMC44LDAuNCwxLjUsMS4xLDEuOWMwLjQsMC4yLDAuOCwwLjMsMS4yLDAuM2MwLjMsMCwwLjctMC4xLDEtMC4yJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2M4LjctNC4yLDIxLTYuNiwzMy44LTYuNmMxMi44LDAsMjUuMiwyLjQsMzMuOCw2LjZjMC43LDAuMywxLjUsMC4zLDIuMi0wLjFjMC43LTAuNCwxLjEtMS4xLDEuMS0xLjl2'+
			'LTQ1LjgmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Qy0xMzcuOSwzNzMuNC0xMzguMywzNzIuNy0xMzksMzcyLjN6IE0tMTQyLjQsNDE2LjVjLTguOS0zLjYtMjAuNi01LjYtMzIuNi01LjZzLTIzLjYsMi0zMi42LDUuNnYtMzguOSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjOC45LDMuNiwyMC42LDUuNiwzMi42LDUuNmMxMiwwLDIzLjYtMiwzMi42LTUuNlY0MTYuNXoiLz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTS0xNTMuNCwzODkuMmMyLjMtMC40LDMuOS0yLjIsMy41LTMuOWMtMC4zLTEuNy0yLjQtMi43LTQuNy0yLjNjLTIuMywwLjQtMy45LDIuMi0zLjUsMy45JiN4ZDsmI3hhOy'+
			'YjeDk7JiN4OTsmI3g5O0MtMTU3LjgsMzg4LjYtMTU1LjcsMzg5LjYtMTUzLjQsMzg5LjJ6Ii8+CiAgPC9nPgogPC9nPgo8L3N2Zz4K';
		me._ht_node_image__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		elo=me._ht_node_image__imgo=document.createElement('img');
		elo.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBiYXNlUHJvZmlsZT0idGlueSIgeD0iMHB4IiBpZD0iTGF5ZXJfMSIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8ZyBpZD0iTG'+
			'F5ZXJfMV8xXyI+CiAgPGc+CiAgIDxwYXRoIGZpbGw9IiMwMDAwMDAiIGQ9Ik0tMTc1LDMzNC43Yy0zNC40LDAtNjIuNCwyNy45LTYyLjQsNjIuNGMwLDM0LjQsMjcuOSw2Mi40LDYyLjQsNjIuNHM2Mi40LTI3LjksNjIuNC02Mi40JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0MtMTEyLjYsMzYyLjctMTQwLjYsMzM0LjctMTc1LDMzNC43eiBNLTEzMy44LDQyMi41YzAsMC45LTAuNCwxLjctMS4yLDIuMWMtMC43LDAuNS0xLjYsMC41LTIuNCwwLjFjLTkuNi00LjYtMjMuMy03LjMtMzcuNi03LjMmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7cy0yOCwyLjctMzcuNiw3LjNjLTAuMywwLjItMC43LDAu'+
			'Mi0xLjEsMC4yYy0wLjUsMC0wLjktMC4xLTEuMy0wLjRjLTAuNy0wLjUtMS4yLTEuMy0xLjItMi4xdi01MC45YzAtMC45LDAuNC0xLjcsMS4yLTIuMSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtjMC43LTAuNSwxLjYtMC41LDIuNC0wLjFjOS42LDQuNiwyMy4zLDcuMywzNy42LDcuM2MxNC4zLDAsMjgtMi43LDM3LjYtNy4zYzAuOC0wLjQsMS43LTAuMywyLjQsMC4xYzAuNywwLjUsMS4yLDEuMywxLjIsMi4xJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0MtMTMzLjgsMzcxLjctMTMzLjgsNDIyLjUtMTMzLjgsNDIyLjV6Ii8+CiAgIDxwYXRoIGZpbGw9IiMwMDAwMDAiIGQ9Ik0tMjExLjIsMzc1Lj'+
			'V2NDMuMmM5LjktNCwyMi45LTYuMiwzNi4yLTYuMnMyNi4zLDIuMiwzNi4yLDYuMnYtNDMuMmMtOS45LDQtMjIuOSw2LjItMzYuMiw2LjImI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Qy0xODguMywzODEuNy0yMDEuMywzNzkuNS0yMTEuMiwzNzUuNXogTS0xNzUsNDEwLjVjLTEyLjQsMC0yNC40LDEuOS0zNC4yLDUuM3YtNy40YzkuNC0xLjYsMjEuNi0yLjUsMzQuMi0yLjUmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzIuMywwLDQuNiwwLDYuOSwwLjFsLTQuNiw0LjVDLTE3My41LDQxMC41LTE3NC4zLDQxMC41LTE3NSw0MTAuNXogTS0xNDAuOCw0MTUuOGMtOC40LTMtMTguNi00LjgtMjkuMi01'+
			'LjJsMTcuMy0xNi45JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MwLjMtMC4zLDAuNy0wLjUsMS4xLTAuNXMwLjgsMC4yLDEuMSwwLjVsOS42LDkuNEMtMTQwLjgsNDAzLjEtMTQwLjgsNDE1LjgtMTQwLjgsNDE1Ljh6IE0tMTUyLjMsMzgxLjVjMi41LTAuNSw0LjksMC42LDUuMywyLjUmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7YzAuNCwxLjktMS40LDMuOC0zLjksNC4zYy0yLjUsMC41LTQuOS0wLjYtNS4zLTIuNUMtMTU2LjYsMzgzLjktMTU0LjgsMzgyLTE1Mi4zLDM4MS41eiBNLTE3MywzODkuMWwxMS4xLDEwLjhsLTQuMiw0LjEmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0yLjktMC4xLT'+
			'UuOS0wLjItOC44LTAuMmMtNiwwLTExLjgsMC4yLTE3LjQsMC42bDE1LjgtMTUuNEMtMTc1LjYsMzg4LjEtMTc0LDM4OC4xLTE3MywzODkuMXoiLz4KICA8L2c+CiA8L2c+CiA8ZyBpZD0iTGF5ZXJfMiI+CiAgPGc+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTkyLjQsNDA0LjVjNS42LTAuNCwxMS40LTAuNiwxNy40LTAuNmMzLDAsNS45LDAuMSw4LjgsMC4ybDQuMi00LjFsLTExLjEtMTAuOGMtMS0xLTIuNi0xLTMuNiwwJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0wtMTkyLjQsNDA0LjV6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTc1LDQwNS45Yy0xMi42LDAtMjQu'+
			'NywwLjktMzQuMiwyLjV2Ny40YzkuNy0zLjQsMjEuOC01LjMsMzQuMi01LjNjMC43LDAsMS41LDAsMi4yLDBsNC42LTQuNSYjeGQ7JiN4YTsmI3g5OyYjeDk7JiN4OTtDLTE3MC40LDQwNS45LTE3Mi43LDQwNS45LTE3NSw0MDUuOXoiLz4KICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTS0xNTEuNiwzOTMuMmMtMC40LDAtMC44LDAuMi0xLjEsMC41bC0xNy4zLDE2LjljMTAuNiwwLjQsMjAuOCwyLjMsMjkuMiw1LjJ2LTEyLjdsLTkuNi05LjQmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Qy0xNTAuNywzOTMuNC0xNTEuMSwzOTMuMi0xNTEuNiwzOTMuMnoiLz4KICAgPHBhdGggZmlsbD0iI0ZGRk'+
			'ZGRiIgZD0iTS0xMzUsMzY5LjVjLTAuNy0wLjUtMS42LTAuNS0yLjQtMC4xYy05LjYsNC42LTIzLjMsNy4zLTM3LjYsNy4zcy0yOC0yLjctMzcuNi03LjMmI3hkOyYjeGE7JiN4OTsmI3g5OyYjeDk7Yy0wLjgtMC40LTEuNy0wLjMtMi40LDAuMWMtMC43LDAuNS0xLjIsMS4zLTEuMiwyLjF2NTAuOWMwLDAuOSwwLjQsMS43LDEuMiwyLjFjMC40LDAuMywwLjksMC40LDEuMywwLjRjMC40LDAsMC43LTAuMSwxLjEtMC4yJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2M5LjYtNC42LDIzLjMtNy4zLDM3LjYtNy4zYzE0LjMsMCwyOCwyLjcsMzcuNiw3LjNjMC44LDAuNCwxLjcsMC4zLDIuNC0wLjFzMS4y'+
			'LTEuMywxLjItMi4xdi01MC45JiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0MtMTMzLjgsMzcwLjgtMTM0LjMsMzcwLTEzNSwzNjkuNXogTS0xMzguOCw0MTguN2MtOS45LTQtMjIuOS02LjItMzYuMi02LjJzLTI2LjMsMi4yLTM2LjIsNi4ydi00My4yYzkuOSw0LDIyLjksNi4yLDM2LjIsNi4yJiN4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O2MxMy4zLDAsMjYuMy0yLjIsMzYuMi02LjJWNDE4Ljd6Ii8+CiAgIDxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0tMTUxLDM4OC4zYzIuNS0wLjUsNC4zLTIuNCwzLjktNC4zYy0wLjQtMS45LTIuNy0zLTUuMy0yLjVjLTIuNSwwLjUtNC4zLDIuNC0zLjksNC4zJi'+
			'N4ZDsmI3hhOyYjeDk7JiN4OTsmI3g5O0MtMTU1LjksMzg3LjctMTUzLjUsMzg4LjgtMTUxLDM4OC4zeiIvPgogIDwvZz4KIDwvZz4KPC9zdmc+Cg==';
		me._ht_node_image__imgo.setAttribute('src',hs);
		elo.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;visibility:hidden;pointer-events:none;;');
		elo['ondragstart']=function() { return false; };
		el.appendChild(elo);
		el.ggId="ht_node_image";
		el.ggDx=0;
		el.ggDy=0;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='cursor : pointer;';
		hs+='height : 32px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : -10000px;';
		hs+='visibility : inherit;';
		hs+='width : 32px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._ht_node_image.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return me.ggNodeId;
		}
		me._ht_node_image.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((player.nodeVisited(me._ht_node_image.ggElementNodeId()) == true)) || 
				((me.hotspot.customimage != ""))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._ht_node_image.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._ht_node_image.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._ht_node_image.style[domTransition]='';
				if (me._ht_node_image.ggCurrentLogicStateVisible == 0) {
					me._ht_node_image.style.visibility="hidden";
					me._ht_node_image.ggVisible=false;
				}
				else {
					me._ht_node_image.style.visibility=(Number(me._ht_node_image.style.opacity)>0||!me._ht_node_image.style.opacity)?'inherit':'hidden';
					me._ht_node_image.ggVisible=true;
				}
			}
		}
		me._ht_node_image.onmouseover=function (e) {
			me._ht_node_image__img.style.visibility='hidden';
			me._ht_node_image__imgo.style.visibility='inherit';
		}
		me._ht_node_image.onmouseout=function (e) {
			me._ht_node_image__img.style.visibility='inherit';
			me._ht_node_image__imgo.style.visibility='hidden';
		}
		me._ht_node_image.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
				var ph=this.parentNode.clientHeight;
				var h=this.offsetHeight;
					this.style.top=(this.ggDy + ph/2 - h/2) + 'px';
			}
		}
		me._ht_node.appendChild(me._ht_node_image);
		el=me._hotspot_preview=document.createElement('div');
		el.ggId="hotspot_preview";
		el.ggDx=0;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_container ";
		el.ggType='container';
		hs ='';
		hs+='z-index: 100;';
		hs+='height : 100px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : -130px;';
		hs+='visibility : hidden;';
		hs+='width : 150px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._hotspot_preview.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return me.ggNodeId;
		}
		me._hotspot_preview.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.elementMouseOver['ht_node'] == true)) && 
				((player.getVariableValue('opt_hotspot_preview') == true)) && 
				((player.getIsTour() == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._hotspot_preview.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._hotspot_preview.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._hotspot_preview.style[domTransition]='';
				if (me._hotspot_preview.ggCurrentLogicStateVisible == 0) {
					me._hotspot_preview.style.visibility=(Number(me._hotspot_preview.style.opacity)>0||!me._hotspot_preview.style.opacity)?'inherit':'hidden';
					me._hotspot_preview.ggVisible=true;
				}
				else {
					me._hotspot_preview.style.visibility="hidden";
					me._hotspot_preview.ggVisible=false;
				}
			}
		}
		me._hotspot_preview.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
		}
		el=me._ht_preview_picture_frame_=document.createElement('div');
		el.ggId="ht_preview_picture_frame ";
		el.ggDx=0;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_rectangle ";
		el.ggType='rectangle';
		hs ='';
		hs+='background : rgba(0,0,0,0.666667);';
		hs+='border : 0px solid #000000;';
		hs+='cursor : default;';
		hs+='height : 100px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 150px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._ht_preview_picture_frame_.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return me.ggNodeId;
		}
		me._ht_preview_picture_frame_.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
		}
		me._hotspot_preview.appendChild(me._ht_preview_picture_frame_);
		el=me._ht_preview_nodeimage=document.createElement('div');
		els=me._ht_preview_nodeimage__img=document.createElement('img');
		els.className='ggskin ggskin_nodeimage';
		els.setAttribute('src',basePath + "images/ht_preview_nodeimage_" + nodeId + ".jpg");
		el.ggNodeId=nodeId;
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els.className='ggskin ggskin_nodeimage';
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="ht_preview_nodeImage";
		el.ggDx=0;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_nodeimage ";
		el.ggType='nodeimage';
		hs ='';
		hs+='height : 90px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : 5px;';
		hs+='visibility : inherit;';
		hs+='width : 140px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='0% 0%';
		me._ht_preview_nodeimage.ggIsActive=function() {
			return player.getCurrentNode()==this.ggElementNodeId();
		}
		el.ggElementNodeId=function() {
			return this.ggNodeId;
		}
		me._ht_preview_nodeimage.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
		}
		me._hotspot_preview.appendChild(me._ht_preview_nodeimage);
		el=me._ht_tooltip=document.createElement('div');
		els=me._ht_tooltip__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="ht_tooltip";
		el.ggDx=0;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='bottom : 5px;';
		hs+='height : 20px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='visibility : inherit;';
		hs+='width : 140px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='bottom:  0px;';
		hs+='width: 140px;';
		hs+='height: auto;';
		hs+='pointer-events: none;';
		hs+='background: #000000;';
		hs+='background: rgba(0,0,0,0.392157);';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='text-align: center;';
		hs+='white-space: pre-wrap;';
		hs+='padding: 2px 3px 2px 3px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		els.innerHTML=me.hotspot.title;
		el.appendChild(els);
		me._ht_tooltip.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return me.ggNodeId;
		}
		me._ht_tooltip.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.hotspot.title == ""))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._ht_tooltip.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._ht_tooltip.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._ht_tooltip.style[domTransition]='';
				if (me._ht_tooltip.ggCurrentLogicStateVisible == 0) {
					me._ht_tooltip.style.visibility="hidden";
					me._ht_tooltip.ggVisible=false;
				}
				else {
					me._ht_tooltip.style.visibility=(Number(me._ht_tooltip.style.opacity)>0||!me._ht_tooltip.style.opacity)?'inherit':'hidden';
					me._ht_tooltip.ggVisible=true;
				}
			}
		}
		me._ht_tooltip.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth + 0;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
		}
		me._hotspot_preview.appendChild(me._ht_tooltip);
		el=me._ht_checkmark_tick=document.createElement('div');
		els=me._ht_checkmark_tick__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgLTI0MCAzMzIgMTMwIDEzMDsiIHZpZXdCb3g9Ii0yNDAgMzMyIDEzMCAxMzAiIHk9IjBweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIwcHgiIGlkPSJMYXllcl8xIiB4bW'+
			'w6c3BhY2U9InByZXNlcnZlIj4KIDxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+JiN4ZDsKCS5zdDB7ZmlsbDojMDAwMDAwO30mI3hkOwoJLnN0MXtmaWxsOiNGRkZGRkY7fSYjeGQ7Cjwvc3R5bGU+CiA8ZyBpZD0iTGF5ZXJfMV8xXyIvPgogPGcgaWQ9IkxheWVyXzIiPgogIDxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0tMTIyLjEsMzQxLjVoLTEwNS44Yy0xLjQsMC0yLjYsMS4xLTIuNiwyLjZ2MTA1LjhjMCwxLjQsMS4xLDIuNiwyLjYsMi42aDEwNS44YzEuNCwwLDIuNi0xLjEsMi42LTIuNlYzNDQuMSYjeGQ7JiN4YTsmI3g5OyYjeDk7Qy0xMTkuNiwzNDIuNy0xMjAuNywzNDEuNS0xMjIuMSwzNDEuNXog'+
			'TS0xMzIuOCwzODEuN2wtNTAuOCw1MC44Yy0wLjMsMC4zLTAuOCwwLjUtMS4yLDAuNWMtMC41LDAtMC45LTAuMS0xLjMtMC41bC0zMS43LTMxLjgmI3hkOyYjeGE7JiN4OTsmI3g5O2MtMC43LTAuNy0wLjctMS43LDAtMi40bDEyLjUtMTIuNWMwLjctMC43LDEuNy0wLjcsMi40LDBsMTgsMThsMzcuMS0zNy4xYzAuNy0wLjcsMS43LTAuNywyLjQsMGwxMi41LDEyLjUmI3hkOyYjeGE7JiN4OTsmI3g5O0MtMTMyLjEsMzc5LjktMTMyLjEsMzgxLTEzMi44LDM4MS43eiIvPgogIDxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0tMTQ3LjcsMzY2LjhsLTM3LjEsMzcuMWwtMTgtMThjLTAuNy0wLjctMS43LTAuNy'+
			'0yLjQsMGwtMTIuNSwxMi41Yy0wLjcsMC43LTAuNywxLjcsMCwyLjRsMzEuNywzMS44JiN4ZDsmI3hhOyYjeDk7JiN4OTtjMC4zLDAuMywwLjgsMC41LDEuMywwLjVjMC40LDAsMC45LTAuMiwxLjItMC41bDUwLjgtNTAuOWMwLjctMC43LDAuNy0xLjcsMC0yLjRsLTEyLjUtMTIuNUMtMTQ1LjksMzY2LjEtMTQ3LDM2Ni4xLTE0Ny43LDM2Ni44eiIvPgogPC9nPgo8L3N2Zz4K';
		me._ht_checkmark_tick__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="ht_checkmark_tick";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='height : 20px;';
		hs+='position : absolute;';
		hs+='right : 7px;';
		hs+='top : 7px;';
		hs+='visibility : hidden;';
		hs+='width : 20px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._ht_checkmark_tick.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return me.ggNodeId;
		}
		me._ht_checkmark_tick.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((player.nodeVisited(me._ht_checkmark_tick.ggElementNodeId()) == true)) || 
				((me._ht_checkmark_tick.ggIsActive() == true))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._ht_checkmark_tick.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._ht_checkmark_tick.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._ht_checkmark_tick.style[domTransition]='';
				if (me._ht_checkmark_tick.ggCurrentLogicStateVisible == 0) {
					me._ht_checkmark_tick.style.visibility=(Number(me._ht_checkmark_tick.style.opacity)>0||!me._ht_checkmark_tick.style.opacity)?'inherit':'hidden';
					me._ht_checkmark_tick.ggVisible=true;
				}
				else {
					me._ht_checkmark_tick.style.visibility="hidden";
					me._ht_checkmark_tick.ggVisible=false;
				}
			}
		}
		me._ht_checkmark_tick.ggUpdatePosition=function (useTransition) {
		}
		me._hotspot_preview.appendChild(me._ht_checkmark_tick);
		me._ht_node.appendChild(me._hotspot_preview);
		el=me._tt_ht_node=document.createElement('div');
		els=me._tt_ht_node__text=document.createElement('div');
		el.className='ggskin ggskin_textdiv';
		el.ggTextDiv=els;
		el.ggId="tt_ht_node";
		el.ggDx=0;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=false;
		el.className="ggskin ggskin_text ";
		el.ggType='text';
		hs ='';
		hs+='z-index: 100;';
		hs+='height : 20px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : 24px;';
		hs+='visibility : hidden;';
		hs+='width : 100px;';
		hs+='pointer-events:none;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		hs ='position:absolute;';
		hs += 'box-sizing: border-box;';
		hs+='cursor: default;';
		hs+='left: 0px;';
		hs+='top:  0px;';
		hs+='width: auto;';
		hs+='height: auto;';
		hs+='pointer-events: none;';
		hs+='background: #000000;';
		hs+='background: rgba(0,0,0,0.666667);';
		hs+='border: 0px solid #000000;';
		hs+='color: rgba(255,255,255,1);';
		hs+='text-align: center;';
		hs+='white-space: nowrap;';
		hs+='padding: 2px 3px 2px 3px;';
		hs+='overflow: hidden;';
		els.setAttribute('style',hs);
		els.innerHTML=me.hotspot.title;
		el.appendChild(els);
		me._tt_ht_node.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return me.ggNodeId;
		}
		me._tt_ht_node.logicBlock_position = function() {
			var newLogicStatePosition;
			if (
				((player.getHasTouch() == true))
			)
			{
				newLogicStatePosition = 0;
			}
			else {
				newLogicStatePosition = -1;
			}
			if (me._tt_ht_node.ggCurrentLogicStatePosition != newLogicStatePosition) {
				me._tt_ht_node.ggCurrentLogicStatePosition = newLogicStatePosition;
				me._tt_ht_node.style[domTransition]='left 0s, top 0s';
				if (me._tt_ht_node.ggCurrentLogicStatePosition == 0) {
					this.ggDx = 0;
					me._tt_ht_node.style.top='-47px';
					me._tt_ht_node.ggUpdatePosition(true);
				}
				else {
					me._tt_ht_node.ggDx=0;
					me._tt_ht_node.style.top='24px';
					me._tt_ht_node.ggUpdatePosition(true);
				}
			}
		}
		me._tt_ht_node.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.elementMouseOver['ht_node'] == true)) && 
				((me.hotspot.title != "")) && 
				((player.getIsTour() == false)) && 
				((player.getVariableValue('opt_hotspot_preview') == false))
			)
			{
				newLogicStateVisible = 0;
			}
			else if (
				((me.elementMouseOver['ht_node'] == true)) && 
				((me.hotspot.title != "")) && 
				((player.getIsTour() == true)) && 
				((player.getVariableValue('opt_hotspot_preview') == false))
			)
			{
				newLogicStateVisible = 1;
			}
			else if (
				((me.elementMouseOver['ht_node'] == true)) && 
				((me.hotspot.title != "")) && 
				((player.getIsTour() == false)) && 
				((player.getVariableValue('opt_hotspot_preview') == true))
			)
			{
				newLogicStateVisible = 2;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._tt_ht_node.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._tt_ht_node.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._tt_ht_node.style[domTransition]='left 0s, top 0s';
				if (me._tt_ht_node.ggCurrentLogicStateVisible == 0) {
					me._tt_ht_node.style.visibility=(Number(me._tt_ht_node.style.opacity)>0||!me._tt_ht_node.style.opacity)?'inherit':'hidden';
					me._tt_ht_node.ggVisible=true;
				}
				else if (me._tt_ht_node.ggCurrentLogicStateVisible == 1) {
					me._tt_ht_node.style.visibility=(Number(me._tt_ht_node.style.opacity)>0||!me._tt_ht_node.style.opacity)?'inherit':'hidden';
					me._tt_ht_node.ggVisible=true;
				}
				else if (me._tt_ht_node.ggCurrentLogicStateVisible == 2) {
					me._tt_ht_node.style.visibility=(Number(me._tt_ht_node.style.opacity)>0||!me._tt_ht_node.style.opacity)?'inherit':'hidden';
					me._tt_ht_node.ggVisible=true;
				}
				else {
					me._tt_ht_node.style.visibility="hidden";
					me._tt_ht_node.ggVisible=false;
				}
			}
		}
		me._tt_ht_node.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth + 0;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
			}
			this.style[domTransition]='left 0';
			this.ggTextDiv.style.left=((98-this.ggTextDiv.offsetWidth)/2) + 'px';
		}
		me._ht_node.appendChild(me._tt_ht_node);
		el=me._ht_node_customimage=document.createElement('div');
		els=me._ht_node_customimage__img=document.createElement('img');
		els.className='ggskin ggskin_external';
		els.setAttribute('style','position: absolute;-webkit-user-drag:none;pointer-events:none;;');
		els.onload=function() {me._ht_node_customimage.ggUpdatePosition();}
		if ((hotspot) && (hotspot.customimage)) {
			el.ggText=hotspot.customimage;
			els.setAttribute('src', hotspot.customimage);
			els.style.width=hotspot.customimagewidth + 'px';
			els.style.height=hotspot.customimageheight + 'px';
			me.ggUse3d = hotspot.use3D;
			me.gg3dDistance = hotspot.distance3D;
		}
		els['ondragstart']=function() { return false; };
		player.checkLoaded.push(els);
		hs ='';
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="ht_node_CustomImage";
		el.ggDx=0;
		el.ggDy=0;
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_external ";
		el.ggType='external';
		hs ='';
		hs+='border : 0px solid #000000;';
		hs+='cursor : pointer;';
		hs+='height : 50px;';
		hs+='left : -10000px;';
		hs+='position : absolute;';
		hs+='top : -10000px;';
		hs+='visibility : inherit;';
		hs+='width : 50px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._ht_node_customimage.ggIsActive=function() {
			if ((this.parentNode) && (this.parentNode.ggIsActive)) {
				return this.parentNode.ggIsActive();
			}
			return false;
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return me.ggNodeId;
		}
		me._ht_node_customimage.logicBlock_visible = function() {
			var newLogicStateVisible;
			if (
				((me.hotspot.customimage == ""))
			)
			{
				newLogicStateVisible = 0;
			}
			else {
				newLogicStateVisible = -1;
			}
			if (me._ht_node_customimage.ggCurrentLogicStateVisible != newLogicStateVisible) {
				me._ht_node_customimage.ggCurrentLogicStateVisible = newLogicStateVisible;
				me._ht_node_customimage.style[domTransition]='';
				if (me._ht_node_customimage.ggCurrentLogicStateVisible == 0) {
					me._ht_node_customimage.style.visibility="hidden";
					me._ht_node_customimage__img.src = '';
					me._ht_node_customimage.ggVisible=false;
				}
				else {
					me._ht_node_customimage.style.visibility=(Number(me._ht_node_customimage.style.opacity)>0||!me._ht_node_customimage.style.opacity)?'inherit':'hidden';
					me._ht_node_customimage.ggSubElement.src=me._ht_node_customimage.ggText;
					me._ht_node_customimage.ggVisible=true;
				}
			}
		}
		me._ht_node_customimage.ggUpdatePosition=function (useTransition) {
			if (useTransition==='undefined') {
				useTransition = false;
			}
			if (!useTransition) {
				this.style[domTransition]='none';
			}
			if (this.parentNode) {
				var pw=this.parentNode.clientWidth;
				var w=this.offsetWidth;
					this.style.left=(this.ggDx + pw/2 - w/2) + 'px';
				var ph=this.parentNode.clientHeight;
				var h=this.offsetHeight;
					this.style.top=(this.ggDy + ph/2 - h/2) + 'px';
			}
			var parentWidth = me._ht_node_customimage.clientWidth;
			var parentHeight = me._ht_node_customimage.clientHeight;
			var img = me._ht_node_customimage__img;
			var aspectRatioDiv = me._ht_node_customimage.clientWidth / me._ht_node_customimage.clientHeight;
			var aspectRatioImg = img.naturalWidth / img.naturalHeight;
			if (img.naturalWidth < parentWidth) parentWidth = img.naturalWidth;
			if (img.naturalHeight < parentHeight) parentHeight = img.naturalHeight;
			var currentWidth,currentHeight;
			if ((hotspot) && (hotspot.customimage)) {
				currentWidth  = hotspot.customimagewidth;
				currentHeight = hotspot.customimageheight;
			}
			img.style.left='50%';
			img.style.marginLeft='-' + currentWidth/2 + 'px';
			img.style.top='50%';
			img.style.marginTop='-' + currentHeight/2 + 'px';
		}
		me._ht_node.appendChild(me._ht_node_customimage);
		if ((hotspot) && (hotspot.customimage)) {
			el.style.width=hotspot.customimagewidth + 'px';
			el.style.height=hotspot.customimageheight + 'px';
		}
		me.__div = me._ht_node;
	};
	me.addSkinHotspot=function(hotspot) {
		var hsinst = null;
		{
			hotspot.skinid = 'ht_node';
			hsinst = new SkinHotspotClass_ht_node(me, hotspot);
			if (!hotspotTemplates.hasOwnProperty(hotspot.skinid)) {
				hotspotTemplates[hotspot.skinid] = [];
			}
			hotspotTemplates[hotspot.skinid].push(hsinst);
			me.callChildLogicBlocksHotspot_ht_node_sizechanged();;
			me.callChildLogicBlocksHotspot_ht_node_changenode();;
			me.callChildLogicBlocksHotspot_ht_node_configloaded();;
			me.callChildLogicBlocksHotspot_ht_node_mouseover();;
			me.callChildLogicBlocksHotspot_ht_node_active();;
			me.callChildLogicBlocksHotspot_ht_node_changevisitednodes();;
			me.callChildLogicBlocksHotspot_ht_node_hastouch();;
			me.callChildLogicBlocksHotspot_ht_node_activehotspotchanged();;
			me.callChildLogicBlocksHotspot_ht_node_varchanged_opt_hotspot_preview();;
		}
		return hsinst;
	}
	me.removeSkinHotspots=function() {
		if(hotspotTemplates['ht_node']) {
			var i;
			for(i = 0; i < hotspotTemplates['ht_node'].length; i++) {
				hotspotTemplates['ht_node'][i] = null;
			}
		}
		hotspotTemplates = [];
	}
	function SkinElement_marker_active_Class(parentScope,ggParent) {
		var me=this;
		var flag=false;
		me.parentScope=parentScope;
		me.ggParent=ggParent;
		var nodeId=ggParent.ggElementNodeId();
		me.ggNodeId=nodeId;
		me.ggUserdata=skin.player.getNodeUserdata(nodeId);
		me.elementMouseDown=[];
		me.elementMouseOver=[];
		
		me.findElements=function(id,regex) {
			return skin.findElements(id,regex);
		}
		
		el=me._marker_active=document.createElement('div');
		els=me._marker_active__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgJy0vL1czQy8vRFREIFNWRyAxLjEvL0VOJyAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE1LjAuMiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMHB4IiBoZWlnaHQ9IjMwcHgiIHZpZXdCb3g9IjAgMCAzMC'+
			'AzMCIgeT0iMHB4IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAzMCAzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiPgogPGcgaWQ9IkxheWVyXzEiPgogIDxjaXJjbGUgc3Ryb2tlLXdpZHRoPSI1IiBjeD0iMTQuOTgxIiBmaWxsPSJub25lIiBzdHJva2Utb3BhY2l0eT0iMSIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBjeT0iMTQuOTg3IiBzdHJva2U9IiMwMDAwMDAiIHI9IjEwLjk5NCIvPgogPC9nPgogPGcgaWQ9IkxheWVyXzFfY29weSI+CiAgPGNpcmNsZSBzdHJva2Utd2lkdGg9IjMiIGN4PSIxNC45ODEiIGZpbGw9'+
			'Im5vbmUiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgY3k9IjE0Ljk4NyIgc3Ryb2tlPSIjRkZGRkZGIiByPSIxMC45OTQiLz4KIDwvZz4KIDxnIGRpc3BsYXk9Im5vbmUiIGlkPSJMYXllcl8zIj4KICA8Y2lyY2xlIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsLW9wYWNpdHk9IjEiIGN4PSIxNC45OCIgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgY3k9IjMuOTk0IiBzdHJva2U9IiNlZTFkM2EiIHI9IjIuMTE3IiBkaXNwbGF5PSJpbmxpbmUiLz4KIDwvZz4KIDxnIGRpc3BsYXk9Im5vbmUiIGlkPSJMYXllcl8yIj4KICA8Y2lyY2xlIHN0cm9rZS'+
			'13aWR0aD0iNSIgY3g9IjE0Ljk4MSIgZmlsbD0ibm9uZSIgc3Ryb2tlLW9wYWNpdHk9IjEiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgY3k9IjE0Ljk4NyIgc3Ryb2tlPSIjMDAwMDAwIiByPSIxMC45OTQiIGRpc3BsYXk9ImlubGluZSIvPgogPC9nPgogPGcgZGlzcGxheT0ibm9uZSIgaWQ9IkxheWVyXzFfY29weSI+CiAgPGNpcmNsZSBzdHJva2Utd2lkdGg9IjMiIGN4PSIxNC45ODEiIGZpbGw9Im5vbmUiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgY3k9IjE0Ljk4NyIgc3Ryb2tlPSIjRkZGRkZGIiByPSIxMC45OTQiIGRpc3BsYXk9ImlubGluZSIvPgogPC9nPgogPGcgaWQ9IkxheWVyXzMiPgog'+
			'IDxjaXJjbGUgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGwtb3BhY2l0eT0iMSIgY3g9IjE0Ljk4IiBmaWxsPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBjeT0iMy45OTQiIHN0cm9rZT0iI2VlMWQzYSIgcj0iMi4xMTciLz4KIDwvZz4KPC9zdmc+Cg==';
		me._marker_active__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="marker_active";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='height : 30px;';
		hs+='left : 105px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 30px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._marker_active.ggIsActive=function() {
			return player.getCurrentNode()==this.ggElementNodeId();
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return me.ggNodeId;
		}
		me._marker_active.ggUpdatePosition=function (useTransition) {
		}
		me._marker_active.ggUpdateConditionTimer=function() {
			var hs='';
			if (me._marker_active.ggParameter) {
				hs+=parameterToTransform(me._marker_active.ggParameter) + ' ';
			}
			hs+='rotate(' + (-1.0*(1 * player.getPanNorth() + 0)) + 'deg) ';
			me._marker_active.style[domTransform]=hs;
		}
player.addListener('timer', me._marker_active.ggUpdateConditionTimer);
	};
	function SkinElement_marker_normal_Class(parentScope,ggParent) {
		var me=this;
		var flag=false;
		me.parentScope=parentScope;
		me.ggParent=ggParent;
		var nodeId=ggParent.ggElementNodeId();
		me.ggNodeId=nodeId;
		me.ggUserdata=skin.player.getNodeUserdata(nodeId);
		me.elementMouseDown=[];
		me.elementMouseOver=[];
		
		me.findElements=function(id,regex) {
			return skin.findElements(id,regex);
		}
		
		el=me._marker_normal=document.createElement('div');
		els=me._marker_normal__img=document.createElement('img');
		els.className='ggskin ggskin_svg';
		hs='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0ndXRmLTgnPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgJy0vL1czQy8vRFREIFNWRyAxLjEvL0VOJyAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE1LjAuMiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIzMHB4IiBoZWlnaHQ9IjMwcHgiIHZpZXdCb3g9IjAgMCAzMC'+
			'AzMCIgeT0iMHB4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMwIDMwIiB4PSIwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiPgogPGcgaWQ9IkxheWVyXzEiIGRpc3BsYXk9Im5vbmUiPgogIDxwYXRoIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0xOS43NTQsMi45MTUmI3hkOyYjeGE7JiN4OTsmI3g5O2MtMC4zNTMsMi4xNTMtMS45MzksNC4wNjYtNC43Niw0LjA2NmMtMi44MjUsMC00LjQxMi0xLjkxOS00Ljc2Mi00LjA3NmMtNC44MjksMS44'+
			'OTktOC4yNTcsNi41OC04LjI1NywxMi4wODMmI3hkOyYjeGE7JiN4OTsmI3g5O2MwLDcuMTgzLDUuODIzLDEzLjAwNywxMy4wMDYsMTMuMDA3YzcuMTg0LDAsMTMuMDA3LTUuODI0LDEzLjAwNy0xMy4wMDdDMjcuOTg3LDkuNDk0LDI0LjU3LDQuODIxLDE5Ljc1NCwyLjkxNXoiIGRpc3BsYXk9ImlubGluZSIvPgogPC9nPgogPGcgaWQ9IkxheWVyXzFfY29weSIgZGlzcGxheT0ibm9uZSI+CiAgPHBhdGggc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZD0iTTE5Ljc1NCwyLjkxNSYjeGQ7JiN4YTsmI3g5OyYjeDk7Yy0wLj'+
			'M1MywyLjE1My0xLjkzOSw0LjA2Ni00Ljc2LDQuMDY2Yy0yLjgyNSwwLTQuNDEyLTEuOTE5LTQuNzYyLTQuMDc2Yy00LjgyOSwxLjg5OS04LjI1Nyw2LjU4LTguMjU3LDEyLjA4MyYjeGQ7JiN4YTsmI3g5OyYjeDk7YzAsNy4xODMsNS44MjMsMTMuMDA3LDEzLjAwNiwxMy4wMDdjNy4xODQsMCwxMy4wMDctNS44MjQsMTMuMDA3LTEzLjAwN0MyNy45ODcsOS40OTQsMjQuNTcsNC44MjEsMTkuNzU0LDIuOTE1eiIgZGlzcGxheT0iaW5saW5lIi8+CiA8L2c+CiA8ZyBpZD0iTGF5ZXJfMyI+CiAgPGNpcmNsZSBzdHJva2Utd2lkdGg9IjMiIGN4PSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTk5OTk5'+
			'IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGN5PSIxNSIgcj0iOC4wNTMiLz4KIDwvZz4KIDxnIGlkPSJMYXllcl8zX2NvcHkiPgogIDxjaXJjbGUgc3Ryb2tlLXdpZHRoPSIyIiBjeD0iMTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBjeT0iMTUiIHI9IjguMDUzIi8+CiA8L2c+CiA8ZyBpZD0iTGF5ZXJfNSIgZGlzcGxheT0ibm9uZSI+CiAgPGNpcmNsZSBjeD0iMTUiIGZpbGw9IiNFRTFEM0EiIGN5PSIyLjAwNyIgcj0iMi4wNTMiIGRpc3BsYXk9ImlubGluZSIvPgogPC9nPgo8L3N2Zz4K';
		me._marker_normal__img.setAttribute('src',hs);
		els.setAttribute('style','position: absolute;top: 0px;left: 0px;width: 100%;height: 100%;-webkit-user-drag:none;pointer-events:none;;');
		els['ondragstart']=function() { return false; };
		el.appendChild(els);
		el.ggSubElement = els;
		el.ggId="marker_normal";
		el.ggParameter={ rx:0,ry:0,a:0,sx:1,sy:1 };
		el.ggVisible=true;
		el.className="ggskin ggskin_svg ";
		el.ggType='svg';
		hs ='';
		hs+='height : 30px;';
		hs+='left : 140px;';
		hs+='position : absolute;';
		hs+='top : 0px;';
		hs+='visibility : inherit;';
		hs+='width : 30px;';
		hs+='pointer-events:auto;';
		el.setAttribute('style',hs);
		el.style[domTransform + 'Origin']='50% 50%';
		me._marker_normal.ggIsActive=function() {
			return player.getCurrentNode()==this.ggElementNodeId();
		}
		el.ggElementNodeId=function() {
			if ((this.parentNode) && (this.parentNode.ggElementNodeId)) {
				return this.parentNode.ggElementNodeId();
			}
			return me.ggNodeId;
		}
		me._marker_normal.ggUpdatePosition=function (useTransition) {
		}
	};
	me.addSkin();
	var style = document.createElement('style');
	style.type = 'text/css';
	style.appendChild(document.createTextNode('.ggskin { font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 14px;} @media (max-width:475px) {.direction_tb{display: none;}}'));
	document.head.appendChild(style);
	me._gyro_on.logicBlock_alpha();
	me._gyro_off.logicBlock_alpha();
	me._marker_title6.logicBlock_position();
	me._marker_title5.logicBlock_position();
	me._marker_title4.logicBlock_position();
	me._marker_title3.logicBlock_position();
	me._marker_title2.logicBlock_position();
	me._marker_title1.logicBlock_position();
	me._marker_title0.logicBlock_position();
	me._marker_title.logicBlock_position();
	player.addListener('changenode', function(args) { me._gyro_on.logicBlock_alpha();me._gyro_off.logicBlock_alpha(); });
	player.addListener('configloaded', function(args) { me._marker_title6.logicBlock_position();me._marker_title5.logicBlock_position();me._marker_title4.logicBlock_position();me._marker_title3.logicBlock_position();me._marker_title2.logicBlock_position();me._marker_title1.logicBlock_position();me._marker_title0.logicBlock_position();me._marker_title.logicBlock_position(); });
	player.addListener('gyrochanged', function(args) { me._gyro_on.logicBlock_alpha();me._gyro_off.logicBlock_alpha(); });
	player.addListener('hastouch', function(args) { me._marker_title6.logicBlock_position();me._marker_title5.logicBlock_position();me._marker_title4.logicBlock_position();me._marker_title3.logicBlock_position();me._marker_title2.logicBlock_position();me._marker_title1.logicBlock_position();me._marker_title0.logicBlock_position();me._marker_title.logicBlock_position(); });
	player.addListener('configloaded', function(args) { me._marker_node6.callChildLogicBlocks_configloaded();me._marker_node5.callChildLogicBlocks_configloaded();me._marker_node4.callChildLogicBlocks_configloaded();me._marker_node3.callChildLogicBlocks_configloaded();me._marker_node1.callChildLogicBlocks_configloaded();me._marker_node2.callChildLogicBlocks_configloaded();me._marker_node7.callChildLogicBlocks_configloaded();me._markertemplate.callChildLogicBlocks_configloaded(); });
	player.addListener('mouseover', function(args) { me._marker_node6.callChildLogicBlocks_mouseover();me._marker_node5.callChildLogicBlocks_mouseover();me._marker_node4.callChildLogicBlocks_mouseover();me._marker_node3.callChildLogicBlocks_mouseover();me._marker_node1.callChildLogicBlocks_mouseover();me._marker_node2.callChildLogicBlocks_mouseover();me._marker_node7.callChildLogicBlocks_mouseover();me._markertemplate.callChildLogicBlocks_mouseover(); });
	player.addListener('mouseover', function(args) { me._marker_node6.callChildLogicBlocks_mouseover();me._marker_node5.callChildLogicBlocks_mouseover();me._marker_node4.callChildLogicBlocks_mouseover();me._marker_node3.callChildLogicBlocks_mouseover();me._marker_node1.callChildLogicBlocks_mouseover();me._marker_node2.callChildLogicBlocks_mouseover();me._marker_node7.callChildLogicBlocks_mouseover();me._markertemplate.callChildLogicBlocks_mouseover(); });
	player.addListener('hastouch', function(args) { me._marker_node6.callChildLogicBlocks_hastouch();me._marker_node5.callChildLogicBlocks_hastouch();me._marker_node4.callChildLogicBlocks_hastouch();me._marker_node3.callChildLogicBlocks_hastouch();me._marker_node1.callChildLogicBlocks_hastouch();me._marker_node2.callChildLogicBlocks_hastouch();me._marker_node7.callChildLogicBlocks_hastouch();me._markertemplate.callChildLogicBlocks_hastouch(); });
	player.addListener('sizechanged', function(args) { me.callChildLogicBlocksHotspot_ht_node_sizechanged(); });
	player.addListener('changenode', function(args) { me.callChildLogicBlocksHotspot_ht_node_changenode(); });
	player.addListener('configloaded', function(args) { me.callChildLogicBlocksHotspot_ht_node_configloaded(); });
	player.addListener('mouseover', function(args) { me.callChildLogicBlocksHotspot_ht_node_mouseover(); });
	player.addListener('changenode', function(args) { me.callChildLogicBlocksHotspot_ht_node_active(); });
	player.addListener('changevisitednodes', function(args) { me.callChildLogicBlocksHotspot_ht_node_changevisitednodes(); });
	player.addListener('hastouch', function(args) { me.callChildLogicBlocksHotspot_ht_node_hastouch(); });
	player.addListener('activehotspotchanged', function(args) { me.callChildLogicBlocksHotspot_ht_node_activehotspotchanged(); });
	player.addListener('varchanged_opt_hotspot_preview', function(args) { me.callChildLogicBlocksHotspot_ht_node_varchanged_opt_hotspot_preview(); });
	player.addListener('hotspotsremoved', function(args) { me.removeSkinHotspots(); });
	document.addEventListener('keydown', function(e) {
		var key = e.which || e.keyCode;
		me.skinKeyPressed = key;
	});
	document.addEventListener('keyup', function(e) {
		var key = e.which || e.keyCode;
		me.skinKeyPressed = 0;
	});
	me.skinTimerEvent();
};var _2BED_pano2vrSkin = pano2vrSkin;