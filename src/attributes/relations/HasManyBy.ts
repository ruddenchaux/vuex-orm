import { Record, NormalizedData } from '../../data'
import BaseModel from '../../model/BaseModel'
import Query, { Relation as Load } from '../../query/Query'
import Relation from './Relation'

export default class HasManyBy extends Relation {
  /**
   * The related BaseModel.
   */
  parent: typeof BaseModel

  /**
   * The foregin key of the model.
   */
  foreignKey: string

  /**
   * The associated key on the parent BaseModel.
   */
  ownerKey: string

  /**
   * Create a new has many by instance.
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
  fill (value: any): (string | number | Record)[] {
    return Array.isArray(value) ? value : []
  }

  /**
   * Make value to be set to BaseModel property. This method is used when
   * instantiating a BaseModel or creating a plain object from a BaseModel.
   */
  make (value: any, _parent: Record, _key: string): BaseModel[] {
    if (value === null) {
      return []
    }

    if (value === undefined) {
      return []
    }

    if (!Array.isArray(value)) {
      return []
    }

    if (value.length === 0) {
      return []
    }

    return value.filter((record) => {
      return record && typeof record === 'object'
    }).map((record) => {
      return new this.parent(record)
    })
  }

  /**
   * Attach the relational key to the given record.
   */
  attach (key: any, record: Record, _data: NormalizedData): void {
    if (key.length === 0) {
      return
    }
    if (record[this.foreignKey] !== undefined) {
      return
    }

    record[this.foreignKey] = key
  }

  /**
   * Load the has many by relationship for the record.
   */
  load (query: Query, collection: Record[], relation: Load): Record[] {
    const relatedPath = this.relatedPath(relation.name)

    const relatedQuery = new Query(query.rootState, this.parent.entity, false)

    this.addConstraint(relatedQuery, relation)

    const relatedRecords = this.mapRecords(relatedQuery.get(), this.ownerKey)

    return collection.map((item) => {
      const related = item[relation.name].reduce((related: Record[], id: any) => {
        if (relatedRecords[id]) {
          related.push(relatedRecords[id])
        }

        return related
      }, [])

      return this.setRelated(item, related, relatedPath)
    })
  }
}
