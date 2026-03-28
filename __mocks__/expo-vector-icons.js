const React = require('react');

const createIcon = (name) => (props) => React.createElement('Text', props);

module.exports = {
  Ionicons: createIcon('Ionicons'),
  MaterialIcons: createIcon('MaterialIcons'),
  FontAwesome: createIcon('FontAwesome'),
};
