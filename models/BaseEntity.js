/**
 * Base Domain Entity
 * OOP Foundation providing unified identity, lifecycle tracking, and serialization abstraction.
 */

class BaseEntity {
  #id;
  #createdAt;
  #updatedAt;

  constructor(id, createdAt = null, updatedAt = null) {
    this.#id = id || this.generateId();
    this.#createdAt = createdAt || new Date().toISOString();
    this.#updatedAt = updatedAt || this.#createdAt;
  }

  get id() {
    return this.#id;
  }

  get createdAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  touch() {
    this.#updatedAt = new Date().toISOString();
  }

  generateId() {
    return 'ent-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Abstract serialization method to be implemented by child classes
   */
  toJSON() {
    return {
      id: this.#id,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }

  /**
   * Crisp, high-signal representation for clean executive reporting
   */
  toCrispSummary() {
    return {
      id: this.#id
    };
  }
}

module.exports = BaseEntity;
