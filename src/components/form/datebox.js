import 'libs/daterangepicker/daterangepicker.css';
import 'libs/daterangepicker/daterangepicker.js';

import BaseForm from './form-base';

class Datebox extends BaseForm{
  constructor(el, options){
    super(el, options, Datebox.DEFAULTS);
    this.className = 'Datebox';
    this.inited = false;
    this._initForm();
  }
  _setDatebox(item, newVal, val){
    let $input = this.$input,
      $datebox = this.$datebox,
      $datetion = this.$datetion,
      $clear = this.$clear;
    if(!this.$input){
      let _input = document.createElement('input');
      let _datebox = document.createElement('div');
      let _datetion = document.createElement('div');
      let _calendar = document.createElement('i');
      let _clear = document.createElement('i');
      $datebox = $(_datebox);
      $input = $(_input);
      $datetion = $(_datetion);
      $clear = $(_clear);
      $(_calendar).addClass('fa fa-calendar form-control-icon');
      $clear.addClass('fa fa-times-circle form-control-icon');
      $input.addClass('form-control has-icon-right');
      $datetion.addClass('si-datebox-datetion').append(_calendar).append(_clear);
      $datebox.addClass('si-datebox').append(_input).append(_datetion);
      this.$formBlock.append(_datebox);
      this.$input = $input;
      this.$datebox = $datebox;
      this.$datetion = $datetion;
      this.$clear = $clear;
      setTimeout(()=>{
        !this.options.readonly&&!this.options.disabled&&this.initDate();
      });
    }
    switch (item) {
      case 'id':
      case 'name':
      case 'placeholder':
        $input.attr(item, newVal);
        break;
      case 'readonly':
        this._setReadonly(newVal);
        break;
      case 'disabled':
        this._setDisabled(newVal);
        break;
      case 'value':
        this._setValue(newVal, val);
        break;
      case 'valid':
        $input.valid(newVal, this);
        break;
      case 'width':
        $input.css('width', newVal);
        break;
    }
  }
  initDate(){
    let op = this.options, $input = this.$input;
    $input.daterangepicker({
      showDropdowns: true,
      autoUpdateInput: false,
      singleDatePicker: true,
      autoApply: true,
      locale: {
        format :op.format
      },
      minDate: op.minDate,
      maxDate: op.maxDate
    }).on('apply.daterangepicker', (ev, picker)=> {
      op.value = picker.startDate.format(op.format);
    }).on('cancel.daterangepicker', ()=> {
      op.value = '';
    });
    this.$clear.on('click',()=>{
      $input.trigger('cancel.daterangepicker');
    });
    this.inited = true;
  }
  _setReadonly(newVal){
    newVal = newVal===undefined||this.options.readonly;
    let $input = this.$input, $datebox = this.$datebox;
    if(newVal){
      $datebox.addClass('si-form-readonly');
      $input.attr('readonly',true);
      this.inited&&this.destroy();
    }else{
      $datebox.removeClass('si-form-readonly');
      $input.removeAttr('readonly');
      this.initDate();
    }
  }
  _setDisabled(newVal){
    newVal = newVal===undefined||this.options.disabled;
    let $input = this.$input, $datebox = this.$datebox;
    if(newVal){
      $datebox.addClass('si-form-disabled');
      $input.attr('disabled',true);
      this.inited&&this.destroy();
    }else{
      $datebox.removeClass('si-form-disabled');
      $input.removeAttr('disabled');
      this.initDate();
    }
  }
  _setValue(newVal, val){
    !this.inited&&this.initDate()&&this._setReadonly()&&this._setDisabled();
    this.$input.val(newVal).trigger('change').daterangepicker('elementChanged');
    if(newVal!==''&&val===''){
      this.$datebox.addClass('si-show-clear');
    }
    if(newVal===''){
      this.$datebox.removeClass('si-show-clear');
    }
  }
  destroy(){
    this.$clear.off('click');
    this.$input.daterangepicker('remove');
    this.inited = false;
  }
}

function Plugin(option) {
  try {
    let value, args = Array.prototype.slice.call(arguments, 1);
    
    this.each(function(){
      let $this = $(this),
        dataSet = $this.data(),
        data = dataSet['si.datebox'];
        
      if (typeof option === 'string') {
        if (!data) {
          return;
        }
        value = data[option].apply(data, args);
        if (option === 'destroy') {
          $this.removeData('si.datebox');
        }
      }
      if (!data) {
        let options = $.extend( {} , Datebox.DEFAULTS, typeof option === 'object' && option);
        let datakeys = Object.keys(dataSet);
        let defaultkeys = Object.keys(options);
        defaultkeys.forEach((key) => {
          let lowkey = key.toLocaleLowerCase();
          if (datakeys.includes(lowkey)) {
            options[key] = dataSet[lowkey];
          }
        });
        data = new Datebox(this, options);
        data.$input.data('si.datebox', data);
      }
    });
    return typeof value === 'undefined' ? this : value;
  } catch (error) {
    throw new Error(error);
  }
}
let old = $.fn.datebox;

$.fn.datebox = Plugin;
$.fn.datebox.Constructor = Datebox;

$.fn.datebox.noConflict = function() {
  $.fn.datebox = old;
  return this;
};

Datebox.DEFAULTS = {
  hasSurface: false,
  label: '',
  id: '',
  name: '',
  labelWidth: '',
  inputWidth: '',
  readonly: false,
  disabled: false,
  value: '',
  placeholder: '',
  size: '',
  helpText: '',
  width: '',
  valid: false,
  format:'YYYY-MM-DD',
  minDate:'',
  maxDate:''
};