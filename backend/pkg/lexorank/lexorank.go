package lexorank

import (
	"fmt"
	"math"
	"strings"
)

const AlphabetSize = 26
const codePointA = 'a'
const codePointZ = 'z'

type Rank string

func (r Rank) Between(other Rank) Rank {
	return CalculateRankBetween(r, other)
}

const magic = 456976

// GetAlphabetForIndex returns the alphabet for the given index
// Example: 0 -> "a", 1 -> "b", 25 -> "z", 26 -> "aa", 27 -> "ab",
// 51 -> "az", 52 -> "ba", 53 -> "bb", 77 -> "bz", 78 -> "ca"
func GetAlphabetForIndex(index int64) Rank {
	if index > magic {
		return Rank(fmt.Sprintf("zzzz%s%c",
			strings.Repeat("z", int(index-magic)/26),
			rune('a'+(index-magic)%26),
		))
	}

	r0 := 'a' + (index/17576)%26
	r1 := 'a' + (index/676)%26
	r2 := 'a' + (index/26)%26
	r3 := 'a' + index%26

	return Rank(fmt.Sprintf("%c%c%c%c", r0, r1, r2, r3))
}

// CalculateRankBetween calculates the rank between two ranks
// Example: "a" and "b" -> "aa", "a" and "c" -> "ab", "a" and "z" -> "ba"
func CalculateRankBetween(firstRank, secondRank Rank) Rank {
	for len(firstRank) != len(secondRank) {
		if len(firstRank) > len(secondRank) {
			secondRank += "a"
		} else {
			firstRank += "a"
		}
	}

	firstPositionCodes := []rune(firstRank)
	secondPositionCodes := []rune(secondRank)

	difference := 0
	for index := len(firstPositionCodes) - 1; index >= 0; index-- {
		firstCode := int(firstPositionCodes[index])
		secondCode := int(secondPositionCodes[index])

		if secondCode < firstCode {
			secondCode += AlphabetSize
			secondPositionCodes[index-1]--
		}

		powRes := int(math.Pow(float64(AlphabetSize), float64(len(firstRank)-index-1)))
		difference += (secondCode - firstCode) * powRes
	}

	var bob strings.Builder
	if difference <= 1 {
		return firstRank + Rank(codePointA+rune(AlphabetSize/2))
	}

	difference = difference / 2
	offset := 0
	for index := 0; index < len(firstRank); index++ {
		diffInSymbols := int(float64(difference)/math.Pow(float64(AlphabetSize), float64(index))) % AlphabetSize
		newElementCode := int(rune(firstRank[len(secondRank)-index-1])) + diffInSymbols + offset
		offset = 0

		if newElementCode > int(codePointZ) {
			offset++
			newElementCode -= AlphabetSize
		}

		bob.WriteRune(rune(newElementCode))
	}

	var reverse strings.Builder
	for i := bob.Len() - 1; i >= 0; i-- {
		reverse.WriteByte(bob.String()[i])
	}

	return Rank(reverse.String())
}
