'use strict';
/* Collection of arrays which serves of values. The index of each array is used
as a indicator of the time associated with the value (eg. day number).

Sparsely collected data streams can be filled out by replacing consecutive empty
entries after a date with the value of the most recent non-empty entry.

To do, there is also a collection_time stream which indicated the index of the
time when each data value was collected.

To this end, it is assumed that every time entry for which one stream has a
non-empty value, all other streams are also non-empty.

An empty entry is considered to be one where the index is not zero and the
collection_time and value are both zero. If a stream value is supposed to be
zero, simply be sure to set the associated collection_time entry.

NOTE: The following are reserved / unavailable streamnames:
streamnames, fillOut, the name of any member of the Proxy class.

Author: Connor W. Colombo
Last Updated: 4/26/2020
*/

export default class TimeseriesCollection {
  // Creates a TimeseriesCollection pre-allocated with N entries for each of the
  // given stream names (an array of strings).
  constructor(N, streamnames){
    this.streamnames = streamnames;

    // Pre-allocate streams:
    this.collection_time = Uint16Array(N);
    this.streamnames.forEach( name => {
      this[name] = Uint16Array(N);
    });

    return new Proxy(this, this);
  }

  // Proxy getter catcher for undefined members:
  get(obj, prop){
    if(prop in obj){
      // If the property exists, return it:
      return obj[prop];
    }
  }

  fillOut(){
    console.error("TimeseriesCollection#fillOut NOT IMPLEMENTED YET.")
  }
}
