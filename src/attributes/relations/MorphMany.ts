import { Record, NormalizedData } from '../../data'
import BaseModel from '../../model/BaseModel'
import Query, { Relation as Load } from '../../query/Query'
import Relation from './Relation'

export type Entity = typeof BaseModel | string

export default class MorphMany extends Relation {
  /**
   * The related BaseModel.
   */
  related: typeof BaseModel

  /**
   * The field name that contains id of the parent BaseModel.
   */
  id: string

  /**
   * The field name fthat contains type of the parent BaseModel.
   */
  type: string

  /**
   * The local key of the model.
   */
  localKey: string

  /**
   * Create a new belongs to instance.
   */
  constructor (model: typeof BaseModel, related: Entity, id: string, type: string, localKey: string) {
    super(model) /* istanbul ignore next */

    this.related = this.model.relation(related)
    this.id = id
    this.type = type
    this.localKey = localKey
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
      return new this.related(record)
    })
  }

  /**
   * Attach the relational key to the given record.
   */
  attach (_key: any, _record: Record, _data: NormalizedData): void {
    return
  }

  /**
   * Load the morph many relationship for the record.
   */
  load (query: Query, collection: Record[], relation: Load): Record[] {
    const relatedQuery = new Query(query.rootState, this.related.entity, false)

    relatedQuery.where(this.type, query.entity)

    this.addConstraint(relatedQuery, relation)

    const relatedRecords = relatedQuery.get().reduce((records, record) => {
      const key = record[this.id]

      if (!records[key]) {
        records[key] = []
      }

      records[key].push(record)

      return records
    }, {} as { [id: string]: Record[] })

    const relatedPath = this.relatedPath(relation.name)

    return collection.map((item) => {
      const related = relatedRecords[item[this.localKey]]

      return this.setRelated(item, related || [], relatedPath)
    })
  }
}
