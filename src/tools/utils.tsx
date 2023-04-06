import { MyConfig } from '@/types/global';
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
} from 'unique-names-generator';

export interface Color {
  r: string;
  g: string;
  b: string;
}

const customConfig: Config = {
  dictionaries: [adjectives, colors],
  separator: '-',
  length: 2,
};

export const randomName = () => {
  return uniqueNamesGenerator(customConfig);
};

export const nameToColor = (name: string) => {
  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = 0; i < name.length / 3; i++) {
    let code = name.charCodeAt(i);
    g = g + code;
    code = name.charCodeAt(i * 2);
    b = b + code;
    code = name.charCodeAt(i * 3);
    r = r + code;
  }
  return [r % 256, g % 256, b % 256];
};

export const weightedRand = (spec: any) => {
  var i,
    j,
    table: any[] = [];
  for (i in spec) {
    // The constant 10 below should be computed based on the
    // weights in the spec for a correct and optimal table size.
    // E.g. the spec {0:0.999, 1:0.001} will break this impl.
    for (j = 0; j < spec[i] * 10; j++) {
      table.push(i);
    }
  }
  return function () {
    return table[Math.floor(Math.random() * table.length)];
  };
};

export const rgbToBgColor = (color: Color) => {
  return (
    'rgb(' +
    color.r +
    ' ' +
    color.b +
    ' ' +
    color.g +
    ' / var(--tw-bg-opacity))'
  );
};

export const strToBgColor = (str: string) => {
  const color = nameToColor(str);
  return (
    'rgb(' +
    color[0] +
    ' ' +
    color[1] +
    ' ' +
    color[2] +
    ' / var(--tw-bg-opacity))'
  );
};

export const strToRGB = (str: string) => {
  const color = nameToColor(str);
  return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
};

export const getLocalStore = () => {

  if (!window?.localStorage) {
    return null;
  } else {
    return window.localStorage;
  }
};

 export const defaultConfig: MyConfig = {
    channelCount: 2,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
}

export function getServerLatency(url: string, callback: (delay: number)=>void) {
    var xhr = new XMLHttpRequest();
    var startTime: number, endTime: number;
  
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        endTime = new Date().getTime();
        var latency = endTime - startTime;
        callback(latency);
      }
    };
  
    startTime = new Date().getTime();
    xhr.open('HEAD', url, true);
    xhr.send();
  }
  