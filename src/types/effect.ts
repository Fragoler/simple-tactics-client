export interface EffectDto {
  type: string
  duration: number
  [key: string]: any
}

export interface IEffect {
  readonly duration: number
  doEffect(): Promise<void>
}
