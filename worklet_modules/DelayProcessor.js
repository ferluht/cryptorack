
class DelayProcessor extends AudioWorkletProcessor {

  static get parameterDescriptors() {
    return [
      {name:'time', defaultValue:1, minValue:0.001, maxValue:10},
      {name:'fb', defaultValue:0.5, minValue:0, maxValue:1},
      {name:'dw', defaultValue:0.5, minValue:0, maxValue:1},

      {name:'time_mod', defaultValue:0, minValue:0, maxValue:1},
      {name:'fb_mod', defaultValue:0, minValue:0, maxValue:1},
      {name:'dw_mod', defaultValue:0, minValue:0, maxValue:1},

      {name:'isPresent', defaultValue:1, minValue:0, maxValue:1}
    ]
  }

  constructor() {
    super();
    this.is_loaded = true;
    this.is_constructed = false;
    this.Delay_Module = Module;

    this.in = 0;
    this.fb = 0;
    this.dw = 1;
    this.time = 1;
    this.out = 0;

    this.buf = [0, 0, 0, 0];
    this.params = [0, 0, 0];

    this.i = 0;
    this.j = 0;

    this.output;
    this.outputChannel;

    this.input;
    this.inputChannel;
  }

  update_buffer() {
    this.buf[0] = this.in;
    this.buf[1] = this.fb;
    this.buf[2] = this.time / 10;
    this.buf[3] = this.dw;
  }

  update_params(parameters, input) {
    this.in = input[0];

    this.time_mod = parameters.time_mod[0];
    this.fb_mod = parameters.fb_mod[0];
    this.dw_mod = parameters.dw_mod[0];

    this.time = this.clamp(parameters.time[0] + this.time_mod * input[1], 0.001, 10);
    this.fb = this.clamp(parameters.fb[0] + this.fb_mod * input[2], 0, 1);
    this.dw = this.clamp(parameters.dw[0] + this.dw_mod * input[3], 0, 1);
  }

  clamp(x, a, b) {
    if (x < a) {
      return a;
    }
    else if (x > b) {
      return b;
    } else {
      return x;
    }
  }

  process (inputs, outputs, parameters) {

    this.output = outputs[0][0];

    if (this.is_loaded) {
      this.Delay_constructor = this.Delay_Module.cwrap('constructor', 'number', []);
      this.Delay_process = this.Delay_Module.cwrap('process', null, ['number', 'number']);
      this.ptr = this.Delay_constructor();
      this.memory = this.Delay_Module.asm[Object.keys(this.Delay_Module.asm)[0]].buffer;
      this.buf = new Float64Array(this.memory, 0, 5);
      this.is_loaded = false;
      this.is_constructed = true;  
    }

    for (this.i = 0; this.i < this.output.length; this.i++) {

      for (this.j = 0; this.j < inputs.length; this.j++) {
        if (inputs[this.j].length > 0) {
          this.params[this.j] = inputs[this.j][0][this.i]
        }
        else {
          this.params[this.j] = 0;
        }
      }

      this.update_params(parameters, this.params);

      if (this.is_constructed) {
        this.update_buffer();
        this.Delay_process(this.ptr, this.buf.byteOffset);
        this.out = this.buf[4];
      }

      this.output[this.i] = this.out;
      
    }

    return (parameters.isPresent[0] == 1);
  }
}

registerProcessor('delay', DelayProcessor)