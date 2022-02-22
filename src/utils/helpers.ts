export const clamp = (value: number | undefined | null, max: number, min: number) => {
    if (!value || value < min) return min
    if (value > max) return max
    return value
}