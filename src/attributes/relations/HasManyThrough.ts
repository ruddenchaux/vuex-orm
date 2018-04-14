import { Record, NormalizedData } from '../../data'
import BaseModel from '../../model/BaseModel'
import Query, { Relation as Load } from '../../query/Query'
import Relation from './Relation'

export type Entity = typeof BaseModel | string

export default class HasManyThrough extends Relation {
  /**
   * The related BaseModel.
   */
  related: typeof BaseModel

  /**
   * The "through" parent BaseModel.
   */
  through: typeof BaseModel

  /**
   * The near key on the relationship.
   */
  firstKey: string

  /**
   * The far key on the relationship.
   */
  secondKey: string

  /**
   * The local key on the relationship.
   */
  localKey: string

  /**
   * The local key on the intermediary BaseModel.
   */
  secondLocalKey: string

  /**
   * Create a new has many through instance.
   */
  constructor (
    model: typeof BaseModel,
    related: Entity,
    through: Entity,
    firstKey: string,
    secondKey: string,
    localKey: string,
    secondLocalKey: string
  ) {
    super(model) /* istanbul ignore next */

    this.related = this.model.relation(related)
    this.through = this.model.relation(through)
    this.firstKey = firstKey
    this.secondKey = secondKey
    this.localKey = localKey
    this.secondLocalKey = secondLocalKey
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
   * Load the has many through relationship for the record.
   */
  load (query: Query, collection: Record[], relation: Load): Record[] {
    const relatedQuery = new Query(query.rootState, this.related.entity, false)

    const relatedRecords = relatedQuery.get().reduce((records, record) => {
      const key = record[this.secondKey]
      if (!records[key]) {
        records[key] = []
      }
      records[key].push(record)
      return records
    }, {})

    this.addConstraint(relatedQuery, relation)

    const throughQuery = new Query(query.rootState, this.through.entity, false)

    const throughRecords = throughQuery.get().reduce((records, record) => {
      const key = record[this.firstKey]

      if (!records[key]) {
        records[key] = []
      }

      if (relatedRecords[record[this.secondLocalKey]]) {
        records[key] = records[key].concat(relatedRecords[record[this.secondLocalKey]])
      }

      return records
    }, {} as { [id: string]: Record[] })

    const relatedPath = this.relatedPath(relation.name)

    return collection.map((item) => {
      const related = throughRecords[item[this.localKey]]

      return this.setRelated(item, related || [], relatedPath)
    })
  }
}
