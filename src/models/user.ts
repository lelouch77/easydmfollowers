import {
  Sequelize,
  Model,
  DataTypes,
  ModelAttributes,
} from "sequelize";

export interface UserAttributes {
  id_str: string;
  name?: string;
  screen_name?: string;
  profile_image_url_https?: string;
  location?: string;
  description?: string;
  verified?: boolean;
  followers_count?: number;
  friends_count?: number;
  listed_count?: number;
  favourites_count?: number;
  statuses_count?: number;
  default_profile?: boolean;
  default_profile_image?: boolean;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}


export class User extends Model<UserAttributes>
  implements UserAttributes {
  public id_str!: string; // Note that the `null assertion` `!` is required in strict mode.
  public name!: string;
  public screen_name!: string;
  public profile_image_url_https!: string
  public location!: string
  public description!: string
  public verified!: boolean
  public followers_count!: number
  public friends_count!: number
  public listed_count!: number
  public favourites_count!: number
  public statuses_count!: number
  public default_profile!: boolean
  public default_profile_image!: boolean
  public status!: number
  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    // projects: Association<User, Project>;
  };
}
const attributes: ModelAttributes = {
  id_str: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: true },
  screen_name: { type: DataTypes.STRING, allowNull: true },
  profile_image_url_https: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.STRING, allowNull: true },
  verified: { type: DataTypes.STRING, allowNull: true },
  followers_count: { type: DataTypes.STRING, allowNull: true },
  friends_count: { type: DataTypes.INTEGER, allowNull: true },
  listed_count: { type: DataTypes.INTEGER, allowNull: true },
  favourites_count: { type: DataTypes.INTEGER, allowNull: true },
  statuses_count: { type: DataTypes.INTEGER, allowNull: true },
  default_profile: { type: DataTypes.BOOLEAN, allowNull: true },
  default_profile_image: { type: DataTypes.BOOLEAN, allowNull: true },
  status: { type: DataTypes.INTEGER, allowNull: false }

};

export function initUser(sequelize: Sequelize): typeof User {
  User.init(attributes, {
    sequelize,
    tableName: "Users",
  })
  return User
}

