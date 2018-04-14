import { Record, NormalizedData } from '../../data'
import BaseModel from '../../model/BaseModel'
import Query, { Relation as Load } from '../../query/Query'
import Relation from './Relation'

export default class BelongsTo extends Relation {
  /**
   * The parent model.
   */
  parent: typeof BaseModel

  /**
   * The foregin key of the model.
   */
  foreignKey: string

  /**
   * The associated key on the parent model.
   */
  ownerKey: string

  /**
   * Create a new belongs to instance.
   */
  constructor (model: typeof BaseModel, parent: typeof BaseModel | string, foreignKey: string, ownerKey: string) {
    super(model) /* istanbul ignore next */

    this.parent = this.model.relation(parent)
    this.foreignKey = foreignKey
    this.ownerKey = ownerKey
  }

  /**
   * Transform given data to the appropriate value. This method will be called
   * during data normalization to fix field that has an incorrect value,
   * or add a missing field with the appropriate default value.
   */
  fill (value: any): string | number | null | Record {
    if (value === undefined) {
      return null
    }

    if (Array.isArray(value)) {
      return null
    }

    return value
  }

  /**
   * Make value to be set to model property. This method is used when
   * instantiating a model or creating a plain object from a model.
   */
  make (value: any, _parent: Record, _key: string): BaseModel | null {
    if (value === null) {
      return null
    }

    if (value === undefined) {
      return null
    }

    if (Array.isArray(value)) {
      return null
    }

    return new this.parent(value)
  }

  /**
   * Attach the relational key to the given record.
   */
  attach (key: any, record: Record, _data: NormalizedData): void {
    if (record[this.foreignKey] !== undefined) {
      return
    }

    record[this.foreignKey] = key
  }

  /**
   * Load the belongs to relationship for the record.
   */
  load (query: Query, collection: Record[], relation: Load): Record[] {
    const relatedPath = this.relatedPath(relation.name)

    const relatedQuery = new Query(query.rootState, this.parent.entity, false)

    this.addConstraint(relatedQuery, relation)

    const relatedRecords = this.mapRecords(relatedQuery.get(), this.ownerKey)

    return collection.map((item) => {
      const related = relatedRecords[item[this.foreignKey]]

      return this.setRelated(item, related || null, relatedPath)
    })
  }
}
