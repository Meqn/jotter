export default {
  easeIn: function(pos){
      return Math.pow(pos, 3);
  },

  easeOut: function(pos){
      return (Math.pow((pos - 1), 3) + 1);
  },

  easeInOut: function(pos){
      if ( (pos /= 0.5) < 1 ) {
          return 0.5 * Math.pow(pos, 3);
      } else {     
          return 0.5 * (Math.pow((pos - 2), 3) + 2);
      }
  },

  linear: function(pos) {
      return pos;
  },
}


function calcTimeByProgress(progress, {duration, timing}) {
  let start = 0;
  let end = duration;
  let time = null;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const midProgress = timing(mid / duration);

    if (midProgress === progress) {
      time = mid;
      break;
    } else if (midProgress < progress) {
      start = mid + 1;
    } else {
      end = mid - 1;
    }
  }

  if (time === null) {
    time = start;
  }

  return time;
}
