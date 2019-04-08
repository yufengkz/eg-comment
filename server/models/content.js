'use strict';
module.exports = (sequelize, DataTypes) => {
  const Content = sequelize.define('Content', {
    user_id: DataTypes.INTEGER
  }, {});
  Content.associate = function(models) {
    // associations can be defined here
  };
  return Content;
};