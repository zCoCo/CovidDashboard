// Collection of utility functions which are used (or could be useful) across
// the interface.

// Returns the indices of every item in the given array, a,
// where the given lambda, f(value, [index]), returns a truthy value. Returns
// [] if f never returns something truthy.
//
// Often allows you to fulfill the same need as with #Array.filter but with
// lower overhead, while maintaining a traceable connection to the original array.
export const findIndices = (a,f) => {
  return a.reduce( (acc, v, i) => ( f(v,i) ? [...acc, i] : acc), [] );
};

// Creates a nicely formatted population string (in the statistical sense) from
// the given population value (Number).
export const formatPopulation = (p) => {
  let power = Math.floor(Math.log10(p));
  let str = "";
  let format = (e) => Number.parseFloat(p/e).toPrecision(3);
  if(power >= 9){
    str = format(1e9) + "B";
  } else if(power >= 6){
    str = format(1e6) + "M";
  } else if(power >= 3){
    str = format(1e3) + "k";
  }

  return Number.parseFloat(Number.parseFloat(p).toPrecision(3)).toFixed(); // TODO: FIXME (this works but the above does not)
}

// Adds the given getter function, f, to the given object, obj, for the given
/// element, elem (a string).
export const addGetter = (obj, elem, f) => {
  Object.defineProperty(obj, elem, {
    get: f
  });
}
