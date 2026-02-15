/**
 * Represents a movie in the domain.
 *
 * Domain object:
 * - immutable
 * - persistence-agnostic
 * - transport-agnostic
 */

export class Movie {
  /**
   * @param id Unique identifier (internal or external)
   * @param title Display title
   * @param overview Optional summary
   */
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly overview?: string,
  ) {}
}
