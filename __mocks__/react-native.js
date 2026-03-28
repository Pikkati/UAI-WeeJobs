let RN = {};
try {
  RN = jest.requireActual('react-native');
} catch (e) {
  RN = {};
}

const EasingFallback = {
  in: (fn) => fn,
  out: (fn) => fn,
  inOut: (fn) => fn,
  linear: (t) => t,
  ease: (t) => t,
};

module.exports = {
  ...RN,
  Easing: RN.Easing || EasingFallback,
};
