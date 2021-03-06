import './textbox';
import './passwordbox';
import './checkbox';
import './radiobox';
import './selectbox';
import './switchbox';
import './filebox';
import './datebox';
import './daterangebox';
import './treebox';
import './combobox';
import '../valid';

import {Log} from '../../libs/log';

// form操作器
class Form {
  constructor(el, op) {
    this.$element = $(el);
    this.options = op;
    this.panel = null;
    op&&this._init();
  }
  _init() {
    let op = this.options;
    this.panel = op.type === 'panel' || op.hasPanel ? this._getPanel() : null;
    for (let i = 0, len = op.list.length; i < len; i++) {
      this._getFormGroup(op.list[i]);
    }
    for (let i = 0, len = op.button.length; i < len; i++) {
      this._getFormBtn(op.button[i]);
    }
  }
  _getPanel() {
    let op = this.options;
    let panel = document.createElement('div');
    let panelHeader = op.hasTitle ? document.createElement('div') : null;
    let panelBody = document.createElement('div');
    panelHeader ? $(panelHeader).addClass('panel-heading').append('<h3 class="panel-title">' + op.title + '</h3>') : null;
    $(panelBody).addClass('panel-body');
    $(panel).addClass('panel panel-' + op.panelType);
    this.$element.wrap(panelBody).parent().wrap(panel).parent().prepend(panelHeader);
    return panel;
  }
  _getFormGroup(el) {
    let formGroup = document.createElement('div');
    let input = document.createElement('input');
    let $input = $(input);
    $input.addClass('btsp-');
    $(formGroup).addClass('form-group').append(input);
    this.$element.append(formGroup);
    try {
      $input[el.type ? el.type : 'textbox'](el);
    } catch (error) {
      Log.error(`form：${el.type}组件解析失败！\n${error}`);
    }
  }
  _getFormBtn() {

  }
  load(obj){
    if(!obj||typeof obj!=='object'){
      throw new Error('表单（Form）插件load方法参数必须为Object对象！');
    }
    this.$element.find('input, textarea').each((i,el) => {
      let $el = $(el), name = $el.attr('name'), type = $el.attr('type');
      if(name===undefined || ['button','reset','submit'].includes(type))return true;
      let valCache = obj[name];
      if(valCache===undefined || valCache === null && name.includes('.')){
        const nameArr = name.split('.');
        valCache = obj;
        nameArr.forEach(a=>{
          valCache = valCache[a];
        });
      }
      if(valCache===undefined || valCache === null)return true;
      if($el.hasClass('si-form-input')){
        let former = $el.data('si-form-type').toLowerCase();
        $el[former]({value:valCache});
        return true;
      }
      $el.val(valCache);
    });
  }
  clear(){
    this.$element.find('.si-form-input').each((i,el)=>{
      let $el = $(el);
      let type = $el.data('si-form-type').toLowerCase();
      $el[type]({value:''});
    });
  }
  data(noValid){
    let $el = this.$element;
    if(noValid!==true){
      if(!$el.valid('check')){
        return false;
      }
    }
    let obj = {};
    $el.serializeArray().forEach(da => {
      let value = da.value.trim().replace(/\n|\r\n/g, '<br>');
      if (obj[da.name]!== undefined) {
        if (Array.isArray(obj[da.name])){
          obj[da.name].push(value);
        }else {
          obj[da.name] = [obj[da.name], value];
        }
      } else {
        obj[da.name] = value;
      }
      // Object.assign(obj,{
      //   [da.name]:da.value.trim().replace(/\n|\r\n/g, '<br>')
      // });
    });
    return obj;
  }
}



function Plugin(option) {
  try {
    let value, args = Array.prototype.slice.call(arguments, 1);
    
    this.each(function(){
      let $this = $(this),
        dataSet = $this.data(),
        data = dataSet['si.form'];
        
      if (typeof option === 'string') {
        if(!data){
          $this.data('si.form', data = new Form(this));
        }
        value = data[option].apply(data, args);
        if (option === 'destroy') {
          $this.removeData('si.form');
        }
      }
      if (typeof option === 'object') {
        let options = $.extend( {} , Form.DEFAULTS, typeof option === 'object' && option);
        let datakeys = Object.keys(dataSet);
        let defaultkeys = Object.keys(options);
        defaultkeys.forEach((key) => {
          let lowkey = key.toLocaleLowerCase();
          if (datakeys.includes(lowkey)) {
            options[key] = dataSet[lowkey];
          }
        });
        $this.data('si.form', new Form(this, options));
      }
    });
    return typeof value === 'undefined' ? this : value;
  } catch (error) {
    throw new Error(error);
  }
}

Form.DEFAULTS = {
  hasPanel: false,
  hasTitle: true,
  panelType: 'default',
  title: '查询条件',
  inline: true,
  labelPosition: 'left',
  labelWidth: 60,
  list: [],
  button: []
};
let old = $.fn.form;

$.fn.form = Plugin;
$.fn.form.defaults = Form.DEFAULTS;
$.fn.form.Constructor = Form;

$.fn.form.noConflict = function() {
  $.fn.form = old;
  return this;
};