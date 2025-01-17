class CombFilterPrim {
  constructor () {
    // this.add_input(new InputEncoder({x:hp2x(0.6), y:66, r:7, vmin:-3, vmax:3, val:0, name:'CV'}));
    // this.add_output(new Port({x:hp2x(0.8), y:108, r:6, name:'OUT'}));
    // this.add_input(new Port({x:hp2x(0.8), y:88, r:6, name:'IN'}));

    this.time = 183;
    this.tone = 1;
    this.fb = 1;
    this.cv = 0; 
    this.in = 0;
    this.out = 0;
    this.SD = new BigSampleDelay(this.time);
  }

  process() {
    // this.in = this.i['IN'].get();
    // this.cv = this.i['CV'].get();
    this.SD.delay = Math.floor(this.time / Math.pow(2, this.cv));
    this.SD.in = (this.in * this.fb + this.SD.out * this.tone);
    this.out = this.SD.out;
    // this.o['OUT'].set(this.out/100);

    this.SD.process();
  }
};