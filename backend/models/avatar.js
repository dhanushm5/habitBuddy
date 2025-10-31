module.exports = (sequelize, DataTypes) => {
  const Avatar = sequelize.define('Avatar', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accessory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shape: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    }
  }, {
    tableName: 'avatars',
    timestamps: true,
  });

  return Avatar;
};
