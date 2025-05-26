import { appDataSource, testDataSource } from "../../../shared/src";

export const dataSource = process.env.NODE_ENV === 'test' ? testDataSource : appDataSource;
