import type { VoyageEventCard } from "../../engine/types";

export function getVoyageEventAdjustment(card: VoyageEventCard): number {
  const amount = card.surchargeAdjustment ??
    (card.effect?.type === "surcharge-adjustment" ? card.effect.amount : 0);
  if (!Number.isInteger(amount) || amount < -5 || amount > 5) {
    throw new Error("Voyage Event surcharge adjustments must be whole numbers from -5 to +5.");
  }
  return amount;
}

export function calculateMaximumOceanSurcharge(
  baseSurcharges: number[],
): number {
  if (baseSurcharges.some((value) => !Number.isInteger(value) || value < 0)) {
    throw new Error("Each base ocean surcharge must be a non-negative whole number.");
  }
  return baseSurcharges.reduce((total, base) => total + base + 5, 0);
}

export function calculateActualOceanSurcharge(
  baseSurcharges: number[],
  eventCards: VoyageEventCard[],
): number {
  if (baseSurcharges.length !== eventCards.length) {
    throw new Error("There must be exactly one Voyage Event for each open-ocean connection.");
  }
  return baseSurcharges.reduce((total, base, index) => {
    if (!Number.isInteger(base) || base < 0) {
      throw new Error("Each base ocean surcharge must be a non-negative whole number.");
    }
    return total + Math.max(0, base + getVoyageEventAdjustment(eventCards[index]));
  }, 0);
}

export function calculateMaximumVoyageProvisions(
  normalArmyProvisionsCost: number,
  baseSurcharges: number[],
): number {
  if (!Number.isInteger(normalArmyProvisionsCost) || normalArmyProvisionsCost < 0) {
    throw new Error("Normal army Provisions cost must be a non-negative whole number.");
  }
  return normalArmyProvisionsCost + calculateMaximumOceanSurcharge(baseSurcharges);
}

export function calculateActualVoyageProvisions(
  normalArmyProvisionsCost: number,
  baseSurcharges: number[],
  eventCards: VoyageEventCard[],
): number {
  if (!Number.isInteger(normalArmyProvisionsCost) || normalArmyProvisionsCost < 0) {
    throw new Error("Normal army Provisions cost must be a non-negative whole number.");
  }
  return normalArmyProvisionsCost + calculateActualOceanSurcharge(baseSurcharges, eventCards);
}
