package basemixed

import (
	"context"
	"fmt"
	"reflect"
	"sort"
	"strconv"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

const (
	// TableName is the DynamoDB table name for all operations.
	TableName = "base-mixed"

	// ColumnPk is the "pk" attribute name.
	ColumnPk = "pk"
	// ColumnSk is the "sk" attribute name.
	ColumnSk = "sk"
	// ColumnName is the "name" attribute name.
	ColumnName = "name"
	// ColumnCount is the "count" attribute name.
	ColumnCount = "count"
	// ColumnIsActive is the "is_active" attribute name.
	ColumnIsActive = "is_active"
	// ColumnTags is the "tags" attribute name.
	ColumnTags = "tags"
	// ColumnScores is the "scores" attribute name.
	ColumnScores = "scores"
)

var (
	// AttributeNames contains all table attribute names for projection expressions.
	// Example: expression.NamesList(expression.Name(AttributeNames[0]))
	AttributeNames = []string{
		"pk",
		"sk",
		"name",
		"count",
		"is_active",
		"tags",
		"scores",
	}

	// KeyAttributeNames contains primary key attributes for key operations.
	// Example: validateKeys(item, KeyAttributeNames)
	KeyAttributeNames = []string{
		"pk",
		"sk",
	}
)

// OperatorType defines the type of operation for queries and filters.
// Provides type-safe operator constants for DynamoDB expressions.
type OperatorType string

const (
	// Equality and comparison operators - work with all comparable types
	EQ  OperatorType = "="
	NE  OperatorType = "<>"
	GT  OperatorType = ">"
	LT  OperatorType = "<"
	GTE OperatorType = ">="
	LTE OperatorType = "<="

	// Range operator for between comparisons
	BETWEEN OperatorType = "BETWEEN"

	// String operators - work with String types and Sets
	CONTAINS     OperatorType = "contains"
	NOT_CONTAINS OperatorType = "not_contains"
	BEGINS_WITH  OperatorType = "begins_with"

	// Set operators for scalar values only (not DynamoDB Sets SS/NS)
	IN     OperatorType = "IN"
	NOT_IN OperatorType = "NOT_IN"

	// Existence operators - work with all types
	EXISTS     OperatorType = "attribute_exists"
	NOT_EXISTS OperatorType = "attribute_not_exists"
)

// ConditionType defines whether this is a key condition or filter condition.
// Key conditions are used in Query operations, filters in both Query and Scan.
type ConditionType string

const (
	KeyCondition    ConditionType = "KEY"    // For partition/sort key conditions
	FilterCondition ConditionType = "FILTER" // For non-key attribute filtering
)

// Condition represents a single query or filter condition with validation metadata.
type Condition struct {
	Field    string        // Attribute name
	Operator OperatorType  // Operation type
	Values   []any         // Operation values
	Type     ConditionType // Key or filter condition
}

// Type-safe handler functions for different expression types.
// Provides compile-time safety for DynamoDB expression building.
type (
	KeyOperatorHandler       func(expression.KeyBuilder, []any) expression.KeyConditionBuilder
	ConditionOperatorHandler func(expression.NameBuilder, []any) expression.ConditionBuilder
)

// keyOperatorHandlers provides O(1) lookup for key condition operations.
// Only includes operators valid for key conditions (partition/sort keys).
var keyOperatorHandlers = map[OperatorType]KeyOperatorHandler{
	EQ: func(field expression.KeyBuilder, values []any) expression.KeyConditionBuilder {
		return field.Equal(expression.Value(values[0]))
	},
	GT: func(field expression.KeyBuilder, values []any) expression.KeyConditionBuilder {
		return field.GreaterThan(expression.Value(values[0]))
	},
	LT: func(field expression.KeyBuilder, values []any) expression.KeyConditionBuilder {
		return field.LessThan(expression.Value(values[0]))
	},
	GTE: func(field expression.KeyBuilder, values []any) expression.KeyConditionBuilder {
		return field.GreaterThanEqual(expression.Value(values[0]))
	},
	LTE: func(field expression.KeyBuilder, values []any) expression.KeyConditionBuilder {
		return field.LessThanEqual(expression.Value(values[0]))
	},
	BETWEEN: func(field expression.KeyBuilder, values []any) expression.KeyConditionBuilder {
		return field.Between(expression.Value(values[0]), expression.Value(values[1]))
	},
}

// allowedKeyConditionOperators defines operators valid for key conditions.
// Single source of truth for key condition validation.
var allowedKeyConditionOperators = map[OperatorType]bool{
	EQ:      true,
	GT:      true,
	LT:      true,
	GTE:     true,
	LTE:     true,
	BETWEEN: true,
}

// conditionOperatorHandlers provides O(1) lookup for filter operations.
// Includes all operators supported in filter expressions.
var conditionOperatorHandlers = map[OperatorType]ConditionOperatorHandler{
	EQ: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return field.Equal(expression.Value(values[0]))
	},
	NE: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return field.NotEqual(expression.Value(values[0]))
	},
	GT: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return field.GreaterThan(expression.Value(values[0]))
	},
	LT: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return field.LessThan(expression.Value(values[0]))
	},
	GTE: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return field.GreaterThanEqual(expression.Value(values[0]))
	},
	LTE: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return field.LessThanEqual(expression.Value(values[0]))
	},
	BETWEEN: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return field.Between(expression.Value(values[0]), expression.Value(values[1]))
	},

	CONTAINS: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return field.Contains(fmt.Sprintf("%v", values[0]))
	},
	NOT_CONTAINS: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return expression.Not(field.Contains(fmt.Sprintf("%v", values[0])))
	},
	BEGINS_WITH: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return field.BeginsWith(fmt.Sprintf("%v", values[0]))
	},

	IN: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		if len(values) == 0 {
			return expression.AttributeNotExists(field)
		}
		if len(values) == 1 {
			return field.Equal(expression.Value(values[0]))
		}
		operands := make([]expression.OperandBuilder, len(values))
		for i, v := range values {
			operands[i] = expression.Value(v)
		}
		return field.In(operands[0], operands[1:]...)
	},
	NOT_IN: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		if len(values) == 0 {
			return expression.AttributeExists(field)
		}
		if len(values) == 1 {
			return field.NotEqual(expression.Value(values[0]))
		}
		operands := make([]expression.OperandBuilder, len(values))
		for i, v := range values {
			operands[i] = expression.Value(v)
		}
		return expression.Not(field.In(operands[0], operands[1:]...))
	},

	EXISTS: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return expression.AttributeExists(field)
	},
	NOT_EXISTS: func(field expression.NameBuilder, values []any) expression.ConditionBuilder {
		return expression.AttributeNotExists(field)
	},
}

// ValidateValues checks if the number of values is correct for the operator.
// Prevents runtime errors by validating value count at build time.
func ValidateValues(op OperatorType, values []any) bool {
	switch op {
	case EQ, NE, GT, LT, GTE, LTE, CONTAINS, NOT_CONTAINS, BEGINS_WITH:
		return len(values) == 1 // Single value operators
	case BETWEEN:
		return len(values) == 2 // Start and end values
	case IN, NOT_IN:
		return len(values) >= 1 // At least one value required
	case EXISTS, NOT_EXISTS:
		return len(values) == 0 // No values needed
	default:
		return false
	}
}

// IsKeyConditionOperator checks if operator can be used in key conditions.
// Key conditions have stricter rules than filter conditions.
func IsKeyConditionOperator(op OperatorType) bool {
	return allowedKeyConditionOperators[op]
}

// ValidateOperator checks if operator is valid for the given field using schema.
// Provides type-safe operator validation based on DynamoDB field types.
func ValidateOperator(fieldName string, op OperatorType) bool {
	if fi, ok := TableSchema.FieldsMap[fieldName]; ok {
		return fi.SupportsOperator(op)
	}
	return false
}

// BuildConditionExpression converts operator to DynamoDB filter expression.
// Creates type-safe filter conditions with full validation.
// Example: BuildConditionExpression("name", EQ, []any{"John"})
func BuildConditionExpression(field string, op OperatorType, values []any) (expression.ConditionBuilder, error) {
	fieldInfo, exists := TableSchema.FieldsMap[field]
	if !exists {
		return expression.ConditionBuilder{}, fmt.Errorf("field %s not found in schema", field)
	}
	if !fieldInfo.SupportsOperator(op) {
		return expression.ConditionBuilder{}, fmt.Errorf("operator %s not supported for field %s (type %s)", op, field, fieldInfo.DynamoType)
	}
	if !ValidateValues(op, values) {
		return expression.ConditionBuilder{}, fmt.Errorf("invalid number of values for operator %s", op)
	}
	handler := conditionOperatorHandlers[op]
	fieldExpr := expression.Name(field)
	result := handler(fieldExpr, values)
	return result, nil
}

// BuildKeyConditionExpression converts operator to DynamoDB key condition.
// Creates type-safe key conditions for Query operations only.
// Example: BuildKeyConditionExpression("user_id", EQ, []any{"123"})
func BuildKeyConditionExpression(field string, op OperatorType, values []any) (expression.KeyConditionBuilder, error) {
	fieldInfo, exists := TableSchema.FieldsMap[field]
	if !exists {
		return expression.KeyConditionBuilder{}, fmt.Errorf("field %s not found in schema", field)
	}
	if !fieldInfo.IsKey {
		return expression.KeyConditionBuilder{}, fmt.Errorf("field %s is not a key field", field)
	}
	if !fieldInfo.SupportsOperator(op) {
		return expression.KeyConditionBuilder{}, fmt.Errorf("operator %s not supported for field %s (type %s)", op, field, fieldInfo.DynamoType)
	}
	if !ValidateValues(op, values) {
		return expression.KeyConditionBuilder{}, fmt.Errorf("invalid number of values for operator %s", op)
	}
	handler := keyOperatorHandlers[op]
	fieldExpr := expression.Key(field)
	result := handler(fieldExpr, values)
	return result, nil
}

// FieldInfo contains metadata about a schema field with operator validation.
type FieldInfo struct {
	DynamoType       string
	IsKey            bool
	IsHashKey        bool
	IsRangeKey       bool
	AllowedOperators map[OperatorType]bool
}

// SupportsOperator checks if this field supports the given operator.
// Returns false for invalid operator/type combinations.
// Example: stringField.SupportsOperator(BEGINS_WITH) -> true
func (fi FieldInfo) SupportsOperator(op OperatorType) bool {
	return fi.AllowedOperators[op]
}

// buildAllowedOperators returns the set of allowed operators for a DynamoDB type.
// Implements DynamoDB operator compatibility rules for each data type.
func buildAllowedOperators(dynamoType string) map[OperatorType]bool {
	allowed := make(map[OperatorType]bool)

	switch dynamoType {
	case "S":
		allowed[EQ] = true
		allowed[NE] = true
		allowed[GT] = true
		allowed[LT] = true
		allowed[GTE] = true
		allowed[LTE] = true
		allowed[BETWEEN] = true
		allowed[CONTAINS] = true
		allowed[NOT_CONTAINS] = true
		allowed[BEGINS_WITH] = true
		allowed[IN] = true
		allowed[NOT_IN] = true
		allowed[EXISTS] = true
		allowed[NOT_EXISTS] = true

	case "N":
		allowed[EQ] = true
		allowed[NE] = true
		allowed[GT] = true
		allowed[LT] = true
		allowed[GTE] = true
		allowed[LTE] = true
		allowed[BETWEEN] = true
		allowed[IN] = true
		allowed[NOT_IN] = true
		allowed[EXISTS] = true
		allowed[NOT_EXISTS] = true

	case "BOOL":
		allowed[EQ] = true
		allowed[NE] = true
		allowed[EXISTS] = true
		allowed[NOT_EXISTS] = true

	case "SS":
		allowed[CONTAINS] = true
		allowed[NOT_CONTAINS] = true
		allowed[EXISTS] = true
		allowed[NOT_EXISTS] = true

	case "NS":
		allowed[CONTAINS] = true
		allowed[NOT_CONTAINS] = true
		allowed[EXISTS] = true
		allowed[NOT_EXISTS] = true

	case "BS":
		allowed[CONTAINS] = true
		allowed[NOT_CONTAINS] = true
		allowed[EXISTS] = true
		allowed[NOT_EXISTS] = true

	case "L":
		allowed[EXISTS] = true
		allowed[NOT_EXISTS] = true

	case "M":
		allowed[EXISTS] = true
		allowed[NOT_EXISTS] = true

	case "NULL":
		allowed[EXISTS] = true
		allowed[NOT_EXISTS] = true

	default:
		allowed[EQ] = true
		allowed[NE] = true
		allowed[EXISTS] = true
		allowed[NOT_EXISTS] = true
	}
	return allowed
}

// DynamoSchema represents the complete table schema with indexes and metadata.
// Provides fast field lookup with O(1) access to operator validation.
type DynamoSchema struct {
	TableName        string
	HashKey          string
	RangeKey         string
	Attributes       []Attribute
	CommonAttributes []Attribute
	SecondaryIndexes []SecondaryIndex
	FieldsMap        map[string]FieldInfo
}

// Attribute represents a DynamoDB table attribute with its type.
type Attribute struct {
	Name string // Attribute name
	Type string // DynamoDB type (S, N, BOOL, SS, NS, etc.)
}

// CompositeKeyPart represents a part of a composite key structure.
// Used for complex key patterns in GSI/LSI definitions.
type CompositeKeyPart struct {
	IsConstant bool   // true if this part is a constant value
	Value      string // the constant value or attribute name
}

// SecondaryIndex represents a GSI or LSI with optional composite keys.
// Supports both simple and composite key structures for advanced access patterns.
type SecondaryIndex struct {
	Name             string
	HashKey          string
	HashKeyParts     []CompositeKeyPart // for composite hash keys
	RangeKey         string
	RangeKeyParts    []CompositeKeyPart // for composite range keys
	ProjectionType   string             // ALL, KEYS_ONLY, or INCLUDE
	NonKeyAttributes []string           // projected attributes for INCLUDE
}

// SchemaItem represents a single DynamoDB item with all table attributes.
// All fields are properly tagged for AWS SDK marshaling/unmarshaling.
type SchemaItem struct {
	Pk       string   `dynamodbav:"pk"`
	Sk       string   `dynamodbav:"sk"`
	Name     string   `dynamodbav:"name"`
	Count    int      `dynamodbav:"count"`
	IsActive bool     `dynamodbav:"is_active"`
	Tags     []string `dynamodbav:"tags,stringset"`
	Scores   []int    `dynamodbav:"scores,numberset"`
}

// TableSchema contains the complete schema definition with pre-computed metadata.
// Used throughout the generated code for validation and operator checking.
var TableSchema = DynamoSchema{
	TableName: "base-mixed",
	HashKey:   "pk",
	RangeKey:  "sk",

	Attributes: []Attribute{
		{Name: "pk", Type: "S"},
		{Name: "sk", Type: "S"},
	},

	CommonAttributes: []Attribute{
		{Name: "name", Type: "S"},
		{Name: "count", Type: "N"},
		{Name: "is_active", Type: "BOOL"},
		{Name: "tags", Type: "SS"},
		{Name: "scores", Type: "NS"},
	},

	SecondaryIndexes: []SecondaryIndex{},

	FieldsMap: map[string]FieldInfo{
		"pk": {
			DynamoType:       "S",
			IsKey:            true,
			IsHashKey:        true,
			IsRangeKey:       false,
			AllowedOperators: buildAllowedOperators("S"),
		},
		"sk": {
			DynamoType:       "S",
			IsKey:            true,
			IsHashKey:        false,
			IsRangeKey:       true,
			AllowedOperators: buildAllowedOperators("S"),
		},
		"name": {
			DynamoType:       "S",
			IsKey:            false,
			IsHashKey:        false,
			IsRangeKey:       false,
			AllowedOperators: buildAllowedOperators("S"),
		},
		"count": {
			DynamoType:       "N",
			IsKey:            false,
			IsHashKey:        false,
			IsRangeKey:       false,
			AllowedOperators: buildAllowedOperators("N"),
		},
		"is_active": {
			DynamoType:       "BOOL",
			IsKey:            false,
			IsHashKey:        false,
			IsRangeKey:       false,
			AllowedOperators: buildAllowedOperators("BOOL"),
		},
		"tags": {
			DynamoType:       "SS",
			IsKey:            false,
			IsHashKey:        false,
			IsRangeKey:       false,
			AllowedOperators: buildAllowedOperators("SS"),
		},
		"scores": {
			DynamoType:       "NS",
			IsKey:            false,
			IsHashKey:        false,
			IsRangeKey:       false,
			AllowedOperators: buildAllowedOperators("NS"),
		},
	},
}

// FilterMixin provides common filtering logic for Query and Scan operations.
// Supports all DynamoDB filter operators with type validation.
type FilterMixin struct {
	FilterConditions []expression.ConditionBuilder
	UsedKeys         map[string]bool
	Attributes       map[string]any
}

// NewFilterMixin creates a new FilterMixin instance with initialized maps.
func NewFilterMixin() FilterMixin {
	return FilterMixin{
		FilterConditions: make([]expression.ConditionBuilder, 0),
		UsedKeys:         make(map[string]bool),
		Attributes:       make(map[string]any),
	}
}

// Filter adds a filter condition using the universal operator system.
// Validates operator compatibility and value types before adding.
func (fm *FilterMixin) Filter(field string, op OperatorType, values ...any) {
	if !ValidateValues(op, values) {
		return
	}
	if !ValidateOperator(field, op) {
		return
	}
	filterCond, err := BuildConditionExpression(field, op, values)
	if err != nil {
		return
	}
	fm.FilterConditions = append(fm.FilterConditions, filterCond)
	fm.UsedKeys[field] = true
	if op == EQ && len(values) == 1 {
		fm.Attributes[field] = values[0]
	}
}

// FilterEQ adds equality filter condition.
// Example: .FilterEQ("status", "active")
func (fm *FilterMixin) FilterEQ(field string, value any) {
	fm.Filter(field, EQ, value)
}

// FilterContains adds contains filter for strings or sets.
// Example: .FilterContains("tags", "important")
func (fm *FilterMixin) FilterContains(field string, value any) {
	fm.Filter(field, CONTAINS, value)
}

// FilterNotContains adds not contains filter for strings or sets.
func (fm *FilterMixin) FilterNotContains(field string, value any) {
	fm.Filter(field, NOT_CONTAINS, value)
}

// FilterBeginsWith adds begins_with filter for strings.
// Example: .FilterBeginsWith("email", "admin@")
func (fm *FilterMixin) FilterBeginsWith(field string, value any) {
	fm.Filter(field, BEGINS_WITH, value)
}

// FilterBetween adds range filter for comparable values.
// Example: .FilterBetween("price", 10, 100)
func (fm *FilterMixin) FilterBetween(field string, start, end any) {
	fm.Filter(field, BETWEEN, start, end)
}

// FilterGT adds greater than filter.
func (fm *FilterMixin) FilterGT(field string, value any) {
	fm.Filter(field, GT, value)
}

// FilterLT adds less than filter.
func (fm *FilterMixin) FilterLT(field string, value any) {
	fm.Filter(field, LT, value)
}

// FilterGTE adds greater than or equal filter.
func (fm *FilterMixin) FilterGTE(field string, value any) {
	fm.Filter(field, GTE, value)
}

// FilterLTE adds less than or equal filter.
func (fm *FilterMixin) FilterLTE(field string, value any) {
	fm.Filter(field, LTE, value)
}

// FilterExists checks if attribute exists.
// Example: .FilterExists("optional_field")
func (fm *FilterMixin) FilterExists(field string) {
	fm.Filter(field, EXISTS)
}

// FilterNotExists checks if attribute does not exist.
func (fm *FilterMixin) FilterNotExists(field string) {
	fm.Filter(field, NOT_EXISTS)
}

// FilterNE adds not equal filter.
func (fm *FilterMixin) FilterNE(field string, value any) {
	fm.Filter(field, NE, value)
}

// FilterIn adds IN filter for scalar values.
// For DynamoDB Sets (SS/NS), use FilterContains instead.
// Example: .FilterIn("category", "books", "electronics")
func (fm *FilterMixin) FilterIn(field string, values ...any) {
	if len(values) == 0 {
		return
	}
	fm.Filter(field, IN, values...)
}

// FilterNotIn adds NOT_IN filter for scalar values.
// For DynamoDB Sets (SS/NS), use FilterNotContains instead.
func (fm *FilterMixin) FilterNotIn(field string, values ...any) {
	if len(values) == 0 {
		return
	}
	fm.Filter(field, NOT_IN, values...)
}

// PaginationMixin provides pagination support for Query and Scan operations.
type PaginationMixin struct {
	LimitValue        *int
	ExclusiveStartKey map[string]types.AttributeValue
}

// NewPaginationMixin creates a new PaginationMixin instance.
func NewPaginationMixin() PaginationMixin {
	return PaginationMixin{}
}

// Limit sets the maximum number of items to return in one request.
// Example: .Limit(25)
func (pm *PaginationMixin) Limit(limit int) {
	pm.LimitValue = &limit
}

// StartFrom sets the exclusive start key for pagination.
// Use LastEvaluatedKey from previous response for next page.
// Example: .StartFrom(previousResponse.LastEvaluatedKey)
func (pm *PaginationMixin) StartFrom(lastEvaluatedKey map[string]types.AttributeValue) {
	pm.ExclusiveStartKey = lastEvaluatedKey
}

// KeyConditionMixin provides key condition logic for Query operations only.
// Supports partition key and sort key conditions with automatic index selection.
type KeyConditionMixin struct {
	KeyConditions    map[string]expression.KeyConditionBuilder
	SortDescending   bool
	PreferredSortKey string
}

// NewKeyConditionMixin creates a new KeyConditionMixin instance.
func NewKeyConditionMixin() KeyConditionMixin {
	return KeyConditionMixin{
		KeyConditions: make(map[string]expression.KeyConditionBuilder),
	}
}

// With adds a key condition using the universal operator system.
// Only valid for partition and sort key attributes.
func (kcm *KeyConditionMixin) With(field string, op OperatorType, values ...any) {
	if !ValidateValues(op, values) {
		return
	}

	fieldInfo, exists := TableSchema.FieldsMap[field]
	if !exists {
		return
	}
	if !fieldInfo.IsKey {
		return
	}
	if !ValidateOperator(field, op) {
		return
	}
	keyCond, err := BuildKeyConditionExpression(field, op, values)
	if err != nil {
		return
	}
	kcm.KeyConditions[field] = keyCond
}

// WithEQ adds equality key condition.
// Required for partition key, optional for sort key.
// Example: .WithEQ("user_id", "123")
func (kcm *KeyConditionMixin) WithEQ(field string, value any) {
	kcm.With(field, EQ, value)
}

// WithBetween adds range key condition for sort keys.
// Example: .WithBetween("created_at", start_time, end_time)
func (kcm *KeyConditionMixin) WithBetween(field string, start, end any) {
	kcm.With(field, BETWEEN, start, end)
}

// WithGT adds greater than key condition for sort keys.
func (kcm *KeyConditionMixin) WithGT(field string, value any) {
	kcm.With(field, GT, value)
}

// WithGTE adds greater than or equal key condition for sort keys.
func (kcm *KeyConditionMixin) WithGTE(field string, value any) {
	kcm.With(field, GTE, value)
}

// WithLT adds less than key condition for sort keys.
func (kcm *KeyConditionMixin) WithLT(field string, value any) {
	kcm.With(field, LT, value)
}

// WithLTE adds less than or equal key condition for sort keys.
func (kcm *KeyConditionMixin) WithLTE(field string, value any) {
	kcm.With(field, LTE, value)
}

// WithPreferredSortKey sets preferred sort key for index selection.
// Useful when multiple indexes match the query pattern.
func (kcm *KeyConditionMixin) WithPreferredSortKey(key string) {
	kcm.PreferredSortKey = key
}

// OrderByDesc sets descending sort order for results.
// Only affects sort key ordering, not filter results.
func (kcm *KeyConditionMixin) OrderByDesc() {
	kcm.SortDescending = true
}

// OrderByAsc sets ascending sort order for results (default).
func (kcm *KeyConditionMixin) OrderByAsc() {
	kcm.SortDescending = false
}

// QueryBuilder provides a fluent interface for building type-safe DynamoDB queries.
// Combines FilterMixin, PaginationMixin, and KeyConditionMixin for comprehensive query building.
// Supports automatic index selection, composite keys, and all DynamoDB query patterns.
type QueryBuilder struct {
	FilterMixin              // Filter conditions for any table attribute
	PaginationMixin          // Limit and pagination support
	KeyConditionMixin        // Key conditions for partition and sort keys
	IndexName         string // Optional index name override
}

// NewQueryBuilder creates a new QueryBuilder instance with initialized mixins.
// All mixins are properly initialized for immediate use.
// Example: query := NewQueryBuilder().WithEQ("user_id", "123").FilterEQ("status", "active")
func NewQueryBuilder() *QueryBuilder {
	return &QueryBuilder{
		FilterMixin:       NewFilterMixin(),
		PaginationMixin:   NewPaginationMixin(),
		KeyConditionMixin: NewKeyConditionMixin(),
	}
}

// Filter adds a filter condition and returns QueryBuilder for method chaining.
// Wraps FilterMixin.Filter with fluent interface support.
func (qb *QueryBuilder) Filter(field string, op OperatorType, values ...any) *QueryBuilder {
	qb.FilterMixin.Filter(field, op, values...)
	return qb
}

// FilterEQ adds equality filter and returns QueryBuilder for method chaining.
// Example: query.FilterEQ("status", "active")
func (qb *QueryBuilder) FilterEQ(field string, value any) *QueryBuilder {
	qb.FilterMixin.FilterEQ(field, value)
	return qb
}

// FilterContains adds contains filter and returns QueryBuilder for method chaining.
// Works with String attributes (substring) and Set attributes (membership).
// Example: query.FilterContains("tags", "premium")
func (qb *QueryBuilder) FilterContains(field string, value any) *QueryBuilder {
	qb.FilterMixin.FilterContains(field, value)
	return qb
}

// FilterNotContains adds not contains filter and returns QueryBuilder for method chaining.
// Opposite of FilterContains for exclusion filtering.
func (qb *QueryBuilder) FilterNotContains(field string, value any) *QueryBuilder {
	qb.FilterMixin.FilterNotContains(field, value)
	return qb
}

// FilterBeginsWith adds begins_with filter and returns QueryBuilder for method chaining.
// Only works with String attributes for prefix matching.
// Example: query.FilterBeginsWith("email", "admin@")
func (qb *QueryBuilder) FilterBeginsWith(field string, value any) *QueryBuilder {
	qb.FilterMixin.FilterBeginsWith(field, value)
	return qb
}

// FilterBetween adds range filter and returns QueryBuilder for method chaining.
// Works with comparable types for inclusive range filtering.
// Example: query.FilterBetween("score", 80, 100)
func (qb *QueryBuilder) FilterBetween(field string, start, end any) *QueryBuilder {
	qb.FilterMixin.FilterBetween(field, start, end)
	return qb
}

// FilterGT adds greater than filter and returns QueryBuilder for method chaining.
// Example: query.FilterGT("last_login", cutoffDate)
func (qb *QueryBuilder) FilterGT(field string, value any) *QueryBuilder {
	qb.FilterMixin.FilterGT(field, value)
	return qb
}

// FilterLT adds less than filter and returns QueryBuilder for method chaining.
// Example: query.FilterLT("attempts", maxAttempts)
func (qb *QueryBuilder) FilterLT(field string, value any) *QueryBuilder {
	qb.FilterMixin.FilterLT(field, value)
	return qb
}

// FilterGTE adds greater than or equal filter and returns QueryBuilder for method chaining.
// Example: query.FilterGTE("age", minimumAge)
func (qb *QueryBuilder) FilterGTE(field string, value any) *QueryBuilder {
	qb.FilterMixin.FilterGTE(field, value)
	return qb
}

// FilterLTE adds less than or equal filter and returns QueryBuilder for method chaining.
// Example: query.FilterLTE("file_size", maxFileSize)
func (qb *QueryBuilder) FilterLTE(field string, value any) *QueryBuilder {
	qb.FilterMixin.FilterLTE(field, value)
	return qb
}

// FilterExists adds attribute exists filter and returns QueryBuilder for method chaining.
// Checks if the specified attribute exists in the item.
// Example: query.FilterExists("optional_field")
func (qb *QueryBuilder) FilterExists(field string) *QueryBuilder {
	qb.FilterMixin.FilterExists(field)
	return qb
}

// FilterNotExists adds attribute not exists filter and returns QueryBuilder for method chaining.
// Checks if the specified attribute does not exist in the item.
func (qb *QueryBuilder) FilterNotExists(field string) *QueryBuilder {
	qb.FilterMixin.FilterNotExists(field)
	return qb
}

// FilterNE adds not equal filter and returns QueryBuilder for method chaining.
// Example: query.FilterNE("status", "deleted")
func (qb *QueryBuilder) FilterNE(field string, value any) *QueryBuilder {
	qb.FilterMixin.FilterNE(field, value)
	return qb
}

// FilterIn adds IN filter and returns QueryBuilder for method chaining.
// For scalar values only - use FilterContains for DynamoDB Sets.
// Example: query.FilterIn("category", "books", "electronics", "clothing")
func (qb *QueryBuilder) FilterIn(field string, values ...any) *QueryBuilder {
	qb.FilterMixin.FilterIn(field, values...)
	return qb
}

// FilterNotIn adds NOT_IN filter and returns QueryBuilder for method chaining.
// For scalar values only - use FilterNotContains for DynamoDB Sets.
func (qb *QueryBuilder) FilterNotIn(field string, values ...any) *QueryBuilder {
	qb.FilterMixin.FilterNotIn(field, values...)
	return qb
}

// With adds key condition and returns QueryBuilder for method chaining.
// Only works with partition and sort key attributes for efficient querying.
// Example: query.With("user_id", EQ, "123").With("created_at", GT, timestamp)
func (qb *QueryBuilder) With(field string, op OperatorType, values ...any) *QueryBuilder {
	qb.KeyConditionMixin.With(field, op, values...)
	if op == EQ && len(values) == 1 {
		qb.Attributes[field] = values[0]
		qb.UsedKeys[field] = true
	}
	return qb
}

// WithEQ adds equality key condition and returns QueryBuilder for method chaining.
// Required for partition keys, commonly used for sort keys.
// Example: query.WithEQ("user_id", "123")
func (qb *QueryBuilder) WithEQ(field string, value any) *QueryBuilder {
	qb.KeyConditionMixin.WithEQ(field, value)
	qb.Attributes[field] = value
	qb.UsedKeys[field] = true
	return qb
}

// WithBetween adds range key condition and returns QueryBuilder for method chaining.
// Only valid for sort keys, not partition keys.
// Example: query.WithBetween("timestamp", startTime, endTime)
func (qb *QueryBuilder) WithBetween(field string, start, end any) *QueryBuilder {
	qb.KeyConditionMixin.WithBetween(field, start, end)
	qb.Attributes[field+"_start"] = start
	qb.Attributes[field+"_end"] = end
	qb.UsedKeys[field] = true
	return qb
}

// WithGT adds greater than key condition and returns QueryBuilder for method chaining.
// Only valid for sort keys in range queries.
// Example: query.WithGT("created_at", yesterday)
func (qb *QueryBuilder) WithGT(field string, value any) *QueryBuilder {
	qb.KeyConditionMixin.WithGT(field, value)
	qb.Attributes[field] = value
	qb.UsedKeys[field] = true
	return qb
}

// WithGTE adds greater than or equal key condition and returns QueryBuilder for method chaining.
// Only valid for sort keys in range queries.
// Example: query.WithGTE("score", minimumScore)
func (qb *QueryBuilder) WithGTE(field string, value any) *QueryBuilder {
	qb.KeyConditionMixin.WithGTE(field, value)
	qb.Attributes[field] = value
	qb.UsedKeys[field] = true
	return qb
}

// WithLT adds less than key condition and returns QueryBuilder for method chaining.
// Only valid for sort keys in range queries.
// Example: query.WithLT("expiry_date", now)
func (qb *QueryBuilder) WithLT(field string, value any) *QueryBuilder {
	qb.KeyConditionMixin.WithLT(field, value)
	qb.Attributes[field] = value
	qb.UsedKeys[field] = true
	return qb
}

// WithLTE adds less than or equal key condition and returns QueryBuilder for method chaining.
// Only valid for sort keys in range queries.
// Example: query.WithLTE("price", maxBudget)
func (qb *QueryBuilder) WithLTE(field string, value any) *QueryBuilder {
	qb.KeyConditionMixin.WithLTE(field, value)
	qb.Attributes[field] = value
	qb.UsedKeys[field] = true
	return qb
}

// WithPreferredSortKey sets the preferred sort key and returns QueryBuilder for method chaining.
// Hints the index selection algorithm when multiple indexes could satisfy the query.
// Example: query.WithPreferredSortKey("created_at")
func (qb *QueryBuilder) WithPreferredSortKey(key string) *QueryBuilder {
	qb.KeyConditionMixin.WithPreferredSortKey(key)
	return qb
}

// OrderByDesc sets descending sort order and returns QueryBuilder for method chaining.
// Only affects sort key ordering, not filter results.
// Example: query.OrderByDesc() // newest first
func (qb *QueryBuilder) OrderByDesc() *QueryBuilder {
	qb.KeyConditionMixin.OrderByDesc()
	return qb
}

// OrderByAsc sets ascending sort order and returns QueryBuilder for method chaining.
// This is the default sort order.
// Example: query.OrderByAsc() // oldest first
func (qb *QueryBuilder) OrderByAsc() *QueryBuilder {
	qb.KeyConditionMixin.OrderByAsc()
	return qb
}

// Limit sets the maximum number of items and returns QueryBuilder for method chaining.
// Controls the number of items returned in a single request.
// Example: query.Limit(25)
func (qb *QueryBuilder) Limit(limit int) *QueryBuilder {
	qb.PaginationMixin.Limit(limit)
	return qb
}

// StartFrom sets the exclusive start key and returns QueryBuilder for method chaining.
// Use LastEvaluatedKey from previous response for pagination.
// Example: query.StartFrom(previousResponse.LastEvaluatedKey)
func (qb *QueryBuilder) StartFrom(lastEvaluatedKey map[string]types.AttributeValue) *QueryBuilder {
	qb.PaginationMixin.StartFrom(lastEvaluatedKey)
	return qb
}

// WithIndexHashKey sets hash key for any index by name.
// Automatically handles both simple and composite keys based on schema metadata.
// For composite keys, pass values in the order they appear in the schema.
// Example: query.WithIndexHashKey("user-status-index", "user123")
// Example: query.WithIndexHashKey("tenant-user-index", "tenant1", "user123") // composite
func (qb *QueryBuilder) WithIndexHashKey(indexName string, values ...any) *QueryBuilder {
	index := qb.getIndexByName(indexName)
	if index == nil {
		return qb
	}

	if index.HashKeyParts != nil {
		nonConstantParts := qb.getNonConstantParts(index.HashKeyParts)
		if len(values) != len(nonConstantParts) {
			return qb
		}
		qb.setCompositeKey(index.HashKey, index.HashKeyParts, values)
	} else {
		if len(values) != 1 {
			return qb
		}
		qb.Attributes[index.HashKey] = values[0]
		qb.UsedKeys[index.HashKey] = true
		qb.KeyConditions[index.HashKey] = expression.Key(index.HashKey).Equal(expression.Value(values[0]))
	}
	return qb
}

// WithIndexRangeKey sets range key for any index by name.
// Automatically handles both simple and composite keys based on schema metadata.
// For composite keys, pass values in the order they appear in the schema.
// Example: query.WithIndexRangeKey("user-status-index", "active")
// Example: query.WithIndexRangeKey("date-type-index", "2023-01-01", "ORDER") // composite
func (qb *QueryBuilder) WithIndexRangeKey(indexName string, values ...any) *QueryBuilder {
	index := qb.getIndexByName(indexName)
	if index == nil || index.RangeKey == "" {
		return qb
	}

	if index.RangeKeyParts != nil {
		nonConstantParts := qb.getNonConstantParts(index.RangeKeyParts)
		if len(values) != len(nonConstantParts) {
			return qb
		}
		qb.setCompositeKey(index.RangeKey, index.RangeKeyParts, values)
	} else {
		if len(values) != 1 {
			return qb
		}
		qb.Attributes[index.RangeKey] = values[0]
		qb.UsedKeys[index.RangeKey] = true
		qb.KeyConditions[index.RangeKey] = expression.Key(index.RangeKey).Equal(expression.Value(values[0]))
	}
	return qb
}

// WithIndexRangeKeyBetween sets range key condition for any index with BETWEEN operator.
// Only works with simple range keys, not composite ones.
// Example: query.WithIndexRangeKeyBetween("date-index", startDate, endDate)
func (qb *QueryBuilder) WithIndexRangeKeyBetween(indexName string, start, end any) *QueryBuilder {
	index := qb.getIndexByName(indexName)
	if index == nil || index.RangeKey == "" || index.RangeKeyParts != nil {
		return qb
	}

	qb.KeyConditions[index.RangeKey] = expression.Key(index.RangeKey).Between(expression.Value(start), expression.Value(end))
	qb.UsedKeys[index.RangeKey] = true
	qb.Attributes[index.RangeKey+"_start"] = start
	qb.Attributes[index.RangeKey+"_end"] = end
	return qb
}

// WithIndexRangeKeyGT sets range key condition for any index with GT operator.
// Only works with simple range keys, not composite ones.
// Example: query.WithIndexRangeKeyGT("score-index", 100)
func (qb *QueryBuilder) WithIndexRangeKeyGT(indexName string, value any) *QueryBuilder {
	index := qb.getIndexByName(indexName)
	if index == nil || index.RangeKey == "" || index.RangeKeyParts != nil {
		return qb
	}

	qb.KeyConditions[index.RangeKey] = expression.Key(index.RangeKey).GreaterThan(expression.Value(value))
	qb.UsedKeys[index.RangeKey] = true
	qb.Attributes[index.RangeKey] = value
	return qb
}

// WithIndexRangeKeyLT sets range key condition for any index with LT operator.
// Only works with simple range keys, not composite ones.
// Example: query.WithIndexRangeKeyLT("timestamp-index", cutoffTime)
func (qb *QueryBuilder) WithIndexRangeKeyLT(indexName string, value any) *QueryBuilder {
	index := qb.getIndexByName(indexName)
	if index == nil || index.RangeKey == "" || index.RangeKeyParts != nil {
		return qb
	}

	qb.KeyConditions[index.RangeKey] = expression.Key(index.RangeKey).LessThan(expression.Value(value))
	qb.UsedKeys[index.RangeKey] = true
	qb.Attributes[index.RangeKey] = value
	return qb
}

// HELPER METHODS for universal index access

// getIndexByName finds index by name in schema metadata.
func (qb *QueryBuilder) getIndexByName(indexName string) *SecondaryIndex {
	for i := range TableSchema.SecondaryIndexes {
		if TableSchema.SecondaryIndexes[i].Name == indexName {
			return &TableSchema.SecondaryIndexes[i]
		}
	}
	return nil
}

// getNonConstantParts returns only non-constant parts of composite key.
func (qb *QueryBuilder) getNonConstantParts(parts []CompositeKeyPart) []CompositeKeyPart {
	var result []CompositeKeyPart
	for _, part := range parts {
		if !part.IsConstant {
			result = append(result, part)
		}
	}
	return result
}

// setCompositeKey builds and sets composite key from parts and values.
func (qb *QueryBuilder) setCompositeKey(keyName string, parts []CompositeKeyPart, values []any) {
	nonConstantParts := qb.getNonConstantParts(parts)

	for i, part := range nonConstantParts {
		if i < len(values) {
			qb.Attributes[part.Value] = values[i]
			qb.UsedKeys[part.Value] = true
		}
	}
	compositeValue := qb.buildCompositeKeyValue(parts)
	qb.Attributes[keyName] = compositeValue
	qb.UsedKeys[keyName] = true
	qb.KeyConditions[keyName] = expression.Key(keyName).Equal(expression.Value(compositeValue))
}

// SCHEMA INTROSPECTION METHODS

// GetIndexNames returns all available index names.
func GetIndexNames() []string {
	names := make([]string, len(TableSchema.SecondaryIndexes))
	for i, index := range TableSchema.SecondaryIndexes {
		names[i] = index.Name
	}
	return names
}

// GetIndexInfo returns detailed information about an index.
func GetIndexInfo(indexName string) *IndexInfo {
	for _, index := range TableSchema.SecondaryIndexes {
		if index.Name == indexName {
			return &IndexInfo{
				Name:             index.Name,
				Type:             getIndexType(index),
				HashKey:          index.HashKey,
				RangeKey:         index.RangeKey,
				IsHashComposite:  len(index.HashKeyParts) > 0,
				IsRangeComposite: len(index.RangeKeyParts) > 0,
				HashKeyParts:     countNonConstantParts(index.HashKeyParts),
				RangeKeyParts:    countNonConstantParts(index.RangeKeyParts),
				ProjectionType:   index.ProjectionType,
			}
		}
	}
	return nil
}

// IndexInfo provides metadata about a table index.
type IndexInfo struct {
	Name             string // Index name
	Type             string // "GSI" or "LSI"
	HashKey          string // Hash key attribute name
	RangeKey         string // Range key attribute name (empty if none)
	IsHashComposite  bool   // Whether hash key is composite
	IsRangeComposite bool   // Whether range key is composite
	HashKeyParts     int    // Number of non-constant hash key parts
	RangeKeyParts    int    // Number of non-constant range key parts
	ProjectionType   string // "ALL", "KEYS_ONLY", or "INCLUDE"
}

func getIndexType(index SecondaryIndex) string {
	if index.HashKey != TableSchema.HashKey {
		return "GSI"
	}
	return "LSI"
}

func countNonConstantParts(parts []CompositeKeyPart) int {
	count := 0
	for _, part := range parts {
		if !part.IsConstant {
			count++
		}
	}
	return count
}

// Build analyzes the query conditions and selects the optimal index for execution.
// Implements smart index selection algorithm considering:
// - Preferred sort key hints from user
// - Number of composite key parts matched
// - Index efficiency for the given query pattern
// Returns index name, key conditions, filter conditions, pagination key, and any errors.
func (qb *QueryBuilder) Build() (string, expression.KeyConditionBuilder, *expression.ConditionBuilder, map[string]types.AttributeValue, error) {
	var filterCond *expression.ConditionBuilder

	sortedIndexes := make([]SecondaryIndex, len(TableSchema.SecondaryIndexes))
	copy(sortedIndexes, TableSchema.SecondaryIndexes)

	sort.Slice(sortedIndexes, func(i, j int) bool {
		if qb.PreferredSortKey != "" {
			iMatches := sortedIndexes[i].RangeKey == qb.PreferredSortKey
			jMatches := sortedIndexes[j].RangeKey == qb.PreferredSortKey

			if iMatches && !jMatches {
				return true
			}
			if !iMatches && jMatches {
				return false
			}
		}
		iParts := qb.calculateIndexParts(sortedIndexes[i])
		jParts := qb.calculateIndexParts(sortedIndexes[j])

		return iParts > jParts
	})

	for _, idx := range sortedIndexes {
		hashKeyCondition, hashKeyMatch := qb.buildHashKeyCondition(idx)
		if !hashKeyMatch {
			continue
		}
		rangeKeyCondition, rangeKeyMatch := qb.buildRangeKeyCondition(idx)
		if !rangeKeyMatch {
			continue
		}
		keyCondition := *hashKeyCondition
		if rangeKeyCondition != nil {
			keyCondition = keyCondition.And(*rangeKeyCondition)
		}
		filterCond = qb.buildFilterCondition(idx)
		return idx.Name, keyCondition, filterCond, qb.ExclusiveStartKey, nil
	}

	if qb.UsedKeys[TableSchema.HashKey] {
		indexName := ""
		keyCondition := expression.Key(TableSchema.HashKey).Equal(expression.Value(qb.Attributes[TableSchema.HashKey]))

		if TableSchema.RangeKey != "" && qb.UsedKeys[TableSchema.RangeKey] {
			if cond, exists := qb.KeyConditions[TableSchema.RangeKey]; exists {
				keyCondition = keyCondition.And(cond)
			} else {
				keyCondition = keyCondition.And(expression.Key(TableSchema.RangeKey).Equal(expression.Value(qb.Attributes[TableSchema.RangeKey])))
			}
		}

		var filterConditions []expression.ConditionBuilder
		for attrName, value := range qb.Attributes {
			if attrName != TableSchema.HashKey && attrName != TableSchema.RangeKey {
				filterConditions = append(filterConditions, expression.Name(attrName).Equal(expression.Value(value)))
			}
		}
		if len(filterConditions) > 0 {
			combinedFilter := filterConditions[0]
			for _, cond := range filterConditions[1:] {
				combinedFilter = combinedFilter.And(cond)
			}
			filterCond = &combinedFilter
		}
		return indexName, keyCondition, filterCond, qb.ExclusiveStartKey, nil
	}
	return "", expression.KeyConditionBuilder{}, nil, nil, fmt.Errorf("no suitable index found for the provided keys")
}

// calculateIndexParts counts the number of composite key parts in an index.
// Used for index selection priority - more specific indexes are preferred.
func (qb *QueryBuilder) calculateIndexParts(idx SecondaryIndex) int {
	parts := 0
	if idx.HashKeyParts != nil {
		parts += len(idx.HashKeyParts)
	}
	if idx.RangeKeyParts != nil {
		parts += len(idx.RangeKeyParts)
	}
	return parts
}

// buildHashKeyCondition creates the hash key condition for a given index.
// Supports both simple hash keys and composite hash keys.
// Returns the condition and whether the index hash key can be satisfied.
func (qb *QueryBuilder) buildHashKeyCondition(idx SecondaryIndex) (*expression.KeyConditionBuilder, bool) {
	if idx.HashKeyParts != nil {
		if qb.hasAllKeys(idx.HashKeyParts) {
			cond := qb.buildCompositeKeyCondition(idx.HashKeyParts)
			return &cond, true
		}
	} else if idx.HashKey != "" && qb.UsedKeys[idx.HashKey] {
		cond := expression.Key(idx.HashKey).Equal(expression.Value(qb.Attributes[idx.HashKey]))
		return &cond, true
	}
	return nil, false
}

// buildRangeKeyCondition creates the range key condition for a given index.
// Supports both simple range keys and composite range keys.
// Range keys are optional - returns true if no range key is defined.
func (qb *QueryBuilder) buildRangeKeyCondition(idx SecondaryIndex) (*expression.KeyConditionBuilder, bool) {
	if idx.RangeKeyParts != nil {
		if qb.hasAllKeys(idx.RangeKeyParts) {
			cond := qb.buildCompositeKeyCondition(idx.RangeKeyParts)
			return &cond, true
		}
	} else if idx.RangeKey != "" {
		if qb.UsedKeys[idx.RangeKey] {
			if cond, exists := qb.KeyConditions[idx.RangeKey]; exists {
				return &cond, true
			} else {
				cond := expression.Key(idx.RangeKey).Equal(expression.Value(qb.Attributes[idx.RangeKey]))
				return &cond, true
			}
		} else {
			return nil, true
		}
	} else {
		return nil, true
	}
	return nil, false
}

// buildFilterCondition creates filter conditions for attributes not part of the index keys.
// Moves non-key conditions to filter expressions for optimal query performance.
func (qb *QueryBuilder) buildFilterCondition(idx SecondaryIndex) *expression.ConditionBuilder {
	var filterConditions []expression.ConditionBuilder

	for attrName, value := range qb.Attributes {
		if qb.isPartOfIndexKey(attrName, idx) {
			continue
		}
		filterConditions = append(filterConditions, expression.Name(attrName).Equal(expression.Value(value)))
	}
	if len(filterConditions) == 0 {
		return nil
	}

	combinedFilter := filterConditions[0]
	for _, cond := range filterConditions[1:] {
		combinedFilter = combinedFilter.And(cond)
	}
	return &combinedFilter
}

// isPartOfIndexKey checks if an attribute is part of the index's key structure.
// Used to determine whether conditions should be key conditions or filter conditions.
func (qb *QueryBuilder) isPartOfIndexKey(attrName string, idx SecondaryIndex) bool {
	if idx.HashKeyParts != nil {
		for _, part := range idx.HashKeyParts {
			if !part.IsConstant && part.Value == attrName {
				return true
			}
		}
	} else if attrName == idx.HashKey {
		return true
	}

	if idx.RangeKeyParts != nil {
		for _, part := range idx.RangeKeyParts {
			if !part.IsConstant && part.Value == attrName {
				return true
			}
		}
	} else if attrName == idx.RangeKey {
		return true
	}
	return false
}

// BuildQuery constructs the final DynamoDB QueryInput with all expressions and parameters.
// Combines key conditions, filter conditions, pagination, and sorting options.
// Example: input, err := queryBuilder.BuildQuery()
func (qb *QueryBuilder) BuildQuery() (*dynamodb.QueryInput, error) {
	indexName, keyCond, filterCond, exclusiveStartKey, err := qb.Build()
	if err != nil {
		return nil, err
	}

	exprBuilder := expression.NewBuilder().WithKeyCondition(keyCond)
	if filterCond != nil {
		exprBuilder = exprBuilder.WithFilter(*filterCond)
	}
	expr, err := exprBuilder.Build()
	if err != nil {
		return nil, fmt.Errorf("failed to build expression: %v", err)
	}
	input := &dynamodb.QueryInput{
		TableName:                 aws.String(TableName),
		KeyConditionExpression:    expr.KeyCondition(),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		ScanIndexForward:          aws.Bool(!qb.SortDescending),
	}
	if indexName != "" {
		input.IndexName = aws.String(indexName)
	}
	if filterCond != nil {
		input.FilterExpression = expr.Filter()
	}
	if qb.LimitValue != nil {
		input.Limit = aws.Int32(int32(*qb.LimitValue))
	}
	if exclusiveStartKey != nil {
		input.ExclusiveStartKey = exclusiveStartKey
	}
	return input, nil
}

// Execute runs the query against DynamoDB and returns strongly-typed results.
// Handles the complete query lifecycle: build input, execute, unmarshal results.
// Example: items, err := queryBuilder.Execute(ctx, dynamoClient)
func (qb *QueryBuilder) Execute(ctx context.Context, client *dynamodb.Client) ([]SchemaItem, error) {
	input, err := qb.BuildQuery()
	if err != nil {
		return nil, err
	}

	result, err := client.Query(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %v", err)
	}
	var items []SchemaItem
	err = attributevalue.UnmarshalListOfMaps(result.Items, &items)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal result: %v", err)
	}
	return items, nil
}

// hasAllKeys checks if all non-constant parts of a composite key are available.
// Used to determine if a composite key can be fully constructed from current conditions.
// Constants are always available, variables must be present in UsedKeys.
func (qb *QueryBuilder) hasAllKeys(parts []CompositeKeyPart) bool {
	for _, part := range parts {
		if !part.IsConstant && !qb.UsedKeys[part.Value] {
			return false
		}
	}
	return true
}

// buildCompositeKeyCondition creates a key condition for composite keys.
// Combines multiple key parts into a single equality condition using "#" separator.
// Used internally by the index selection algorithm for complex key structures.
func (qb *QueryBuilder) buildCompositeKeyCondition(parts []CompositeKeyPart) expression.KeyConditionBuilder {
	compositeKeyName := qb.getCompositeKeyName(parts)
	compositeValue := qb.buildCompositeKeyValue(parts)
	return expression.Key(compositeKeyName).Equal(expression.Value(compositeValue))
}

// getCompositeKeyName generates the attribute name for a composite key.
// For single parts, returns the part name directly.
// For multiple parts, joins them with "#" separator for DynamoDB storage.
// Example: ["user", "tenant"] -> "user#tenant"
func (qb *QueryBuilder) getCompositeKeyName(parts []CompositeKeyPart) string {
	switch len(parts) {
	case 0:
		return ""
	case 1:
		return parts[0].Value
	default:
		names := make([]string, len(parts))
		for i, part := range parts {
			names[i] = part.Value
		}
		return strings.Join(names, "#")
	}
}

// buildCompositeKeyValue constructs the actual value for a composite key.
// Combines constant values and variable values from query attributes.
// Uses "#" separator to create a single string value for DynamoDB.
// Example: constant "USER" + variable "123" -> "USER#123"
func (qb *QueryBuilder) buildCompositeKeyValue(parts []CompositeKeyPart) string {
	if len(parts) == 0 {
		return ""
	}
	values := make([]string, len(parts))
	for i, part := range parts {
		if part.IsConstant {
			values[i] = part.Value
		} else {
			values[i] = qb.formatAttributeValue(qb.Attributes[part.Value])
		}
	}
	return strings.Join(values, "#")
}

// formatAttributeValue converts any Go value to its string representation for composite keys.
// Provides optimized fast paths for common types (string, bool) and proper handling
// of complex types through AWS SDK marshaling. Ensures consistent string formatting
// for reliable composite key construction.
func (qb *QueryBuilder) formatAttributeValue(value interface{}) string {
	if value == nil {
		return ""
	}

	switch v := value.(type) {
	case string:
		return v
	case bool:
		if v {
			return "true"
		}
		return "false"
	}
	av, err := attributevalue.Marshal(value)
	if err != nil {
		return fmt.Sprintf("%v", value)
	}

	switch typed := av.(type) {
	case *types.AttributeValueMemberS:
		return typed.Value
	case *types.AttributeValueMemberN:
		return typed.Value
	case *types.AttributeValueMemberBOOL:
		if typed.Value {
			return "true"
		}
		return "false"
	case *types.AttributeValueMemberSS:
		return strings.Join(typed.Value, ",")
	case *types.AttributeValueMemberNS:
		return strings.Join(typed.Value, ",")
	default:
		return fmt.Sprintf("%v", value)
	}
}

// ScanBuilder provides a fluent interface for building DynamoDB scan operations.
// Scans read every item in a table or index, applying filters after data is read.
// Use Query for efficient key-based access; use Scan for full table analysis.
// Combines FilterMixin and PaginationMixin for comprehensive scan functionality.
type ScanBuilder struct {
	FilterMixin                              // Filter conditions applied after reading items
	PaginationMixin                          // Limit and pagination support
	IndexName            string              // Optional secondary index to scan
	ProjectionAttributes []string            // Specific attributes to return
	ParallelScanConfig   *ParallelScanConfig // Parallel scan configuration
}

// ParallelScanConfig configures parallel scan operations for improved throughput.
// Divides the table into segments that can be scanned concurrently.
// Each worker scans one segment, reducing overall scan time for large tables.
type ParallelScanConfig struct {
	TotalSegments int // Total number of segments to divide the table into
	Segment       int // Which segment this scan worker should process (0-based)
}

// NewScanBuilder creates a new ScanBuilder instance with initialized mixins.
// All mixins are properly initialized for immediate use.
// Example: scan := NewScanBuilder().FilterEQ("status", "active").Limit(100)
func NewScanBuilder() *ScanBuilder {
	return &ScanBuilder{
		FilterMixin:     NewFilterMixin(),
		PaginationMixin: NewPaginationMixin(),
	}
}

// Filter adds a filter condition and returns ScanBuilder for method chaining.
// Filters are applied after items are read from DynamoDB.
// Example: scan.Filter("score", GT, 80)
func (sb *ScanBuilder) Filter(field string, op OperatorType, values ...any) *ScanBuilder {
	sb.FilterMixin.Filter(field, op, values...)
	return sb
}

// FilterEQ adds equality filter and returns ScanBuilder for method chaining.
// Example: scan.FilterEQ("status", "active")
func (sb *ScanBuilder) FilterEQ(field string, value any) *ScanBuilder {
	sb.FilterMixin.FilterEQ(field, value)
	return sb
}

// FilterContains adds contains filter and returns ScanBuilder for method chaining.
// Works with String attributes (substring) and Set attributes (membership).
// Example: scan.FilterContains("tags", "premium")
func (sb *ScanBuilder) FilterContains(field string, value any) *ScanBuilder {
	sb.FilterMixin.FilterContains(field, value)
	return sb
}

// FilterNotContains adds not contains filter and returns ScanBuilder for method chaining.
// Opposite of FilterContains for exclusion filtering.
func (sb *ScanBuilder) FilterNotContains(field string, value any) *ScanBuilder {
	sb.FilterMixin.FilterNotContains(field, value)
	return sb
}

// FilterBeginsWith adds begins_with filter and returns ScanBuilder for method chaining.
// Only works with String attributes for prefix matching.
// Example: scan.FilterBeginsWith("email", "admin@")
func (sb *ScanBuilder) FilterBeginsWith(field string, value any) *ScanBuilder {
	sb.FilterMixin.FilterBeginsWith(field, value)
	return sb
}

// FilterBetween adds range filter and returns ScanBuilder for method chaining.
// Works with comparable types for inclusive range filtering.
// Example: scan.FilterBetween("score", 80, 100)
func (sb *ScanBuilder) FilterBetween(field string, start, end any) *ScanBuilder {
	sb.FilterMixin.FilterBetween(field, start, end)
	return sb
}

// FilterGT adds greater than filter and returns ScanBuilder for method chaining.
// Example: scan.FilterGT("last_login", cutoffDate)
func (sb *ScanBuilder) FilterGT(field string, value any) *ScanBuilder {
	sb.FilterMixin.FilterGT(field, value)
	return sb
}

// FilterLT adds less than filter and returns ScanBuilder for method chaining.
// Example: scan.FilterLT("attempts", maxAttempts)
func (sb *ScanBuilder) FilterLT(field string, value any) *ScanBuilder {
	sb.FilterMixin.FilterLT(field, value)
	return sb
}

// FilterGTE adds greater than or equal filter and returns ScanBuilder for method chaining.
// Example: scan.FilterGTE("age", minimumAge)
func (sb *ScanBuilder) FilterGTE(field string, value any) *ScanBuilder {
	sb.FilterMixin.FilterGTE(field, value)
	return sb
}

// FilterLTE adds less than or equal filter and returns ScanBuilder for method chaining.
// Example: scan.FilterLTE("file_size", maxFileSize)
func (sb *ScanBuilder) FilterLTE(field string, value any) *ScanBuilder {
	sb.FilterMixin.FilterLTE(field, value)
	return sb
}

// FilterExists adds attribute exists filter and returns ScanBuilder for method chaining.
// Checks if the specified attribute exists in the item.
// Example: scan.FilterExists("optional_field")
func (sb *ScanBuilder) FilterExists(field string) *ScanBuilder {
	sb.FilterMixin.FilterExists(field)
	return sb
}

// FilterNotExists adds attribute not exists filter and returns ScanBuilder for method chaining.
// Checks if the specified attribute does not exist in the item.
func (sb *ScanBuilder) FilterNotExists(field string) *ScanBuilder {
	sb.FilterMixin.FilterNotExists(field)
	return sb
}

// FilterNE adds not equal filter and returns ScanBuilder for method chaining.
// Example: scan.FilterNE("status", "deleted")
func (sb *ScanBuilder) FilterNE(field string, value any) *ScanBuilder {
	sb.FilterMixin.FilterNE(field, value)
	return sb
}

// FilterIn adds IN filter and returns ScanBuilder for method chaining.
// For scalar values only - use FilterContains for DynamoDB Sets.
// Example: scan.FilterIn("category", "books", "electronics", "clothing")
func (sb *ScanBuilder) FilterIn(field string, values ...any) *ScanBuilder {
	sb.FilterMixin.FilterIn(field, values...)
	return sb
}

// FilterNotIn adds NOT_IN filter and returns ScanBuilder for method chaining.
// For scalar values only - use FilterNotContains for DynamoDB Sets.
func (sb *ScanBuilder) FilterNotIn(field string, values ...any) *ScanBuilder {
	sb.FilterMixin.FilterNotIn(field, values...)
	return sb
}

// Limit sets the maximum number of items and returns ScanBuilder for method chaining.
// Controls the number of items returned in a single scan request.
// Note: DynamoDB may return fewer items due to size limits even with this setting.
// Example: scan.Limit(100)
func (sb *ScanBuilder) Limit(limit int) *ScanBuilder {
	sb.PaginationMixin.Limit(limit)
	return sb
}

// StartFrom sets the exclusive start key and returns ScanBuilder for method chaining.
// Use LastEvaluatedKey from previous response for pagination.
// Example: scan.StartFrom(previousResponse.LastEvaluatedKey)
func (sb *ScanBuilder) StartFrom(lastEvaluatedKey map[string]types.AttributeValue) *ScanBuilder {
	sb.PaginationMixin.StartFrom(lastEvaluatedKey)
	return sb
}

// WithIndex sets the index name for scanning a secondary index.
// Allows scanning GSI or LSI instead of the main table.
// Index must exist and be in ACTIVE state.
// Example: scan.WithIndex("status-index")
func (sb *ScanBuilder) WithIndex(indexName string) *ScanBuilder {
	sb.IndexName = indexName
	return sb
}

// WithProjection sets the projection attributes to return specific fields only.
// Reduces network traffic and costs by returning only needed attributes.
// Pass attribute names that should be included in the response.
// Example: scan.WithProjection([]string{"id", "name", "status"})
func (sb *ScanBuilder) WithProjection(attributes []string) *ScanBuilder {
	sb.ProjectionAttributes = attributes
	return sb
}

// WithParallelScan configures parallel scan settings for improved throughput.
// Divides the table into segments for concurrent processing by multiple workers.
// totalSegments: how many segments to divide the table (typically number of workers)
// segment: which segment this worker processes (0-based, must be < totalSegments)
// Example: scan.WithParallelScan(4, 0) // Process segment 0 of 4 total segments
func (sb *ScanBuilder) WithParallelScan(totalSegments, segment int) *ScanBuilder {
	sb.ParallelScanConfig = &ParallelScanConfig{
		TotalSegments: totalSegments,
		Segment:       segment,
	}
	return sb
}

// BuildScan constructs the final DynamoDB ScanInput with all configured options.
// Combines filter conditions, projection attributes, pagination, and parallel scan settings.
// Handles expression building and attribute mapping automatically.
// Example: input, err := scanBuilder.BuildScan()
func (sb *ScanBuilder) BuildScan() (*dynamodb.ScanInput, error) {
	input := &dynamodb.ScanInput{
		TableName: aws.String(TableName),
	}

	if sb.IndexName != "" {
		input.IndexName = aws.String(sb.IndexName)
	}
	var exprBuilder expression.Builder
	hasExpression := false

	if len(sb.FilterConditions) > 0 {
		combinedFilter := sb.FilterConditions[0]
		for _, condition := range sb.FilterConditions[1:] {
			combinedFilter = combinedFilter.And(condition)
		}
		exprBuilder = exprBuilder.WithFilter(combinedFilter)
		hasExpression = true
	}

	if len(sb.ProjectionAttributes) > 0 {
		var projectionBuilder expression.ProjectionBuilder
		for i, attr := range sb.ProjectionAttributes {
			if i == 0 {
				projectionBuilder = expression.NamesList(expression.Name(attr))
			} else {
				projectionBuilder = projectionBuilder.AddNames(expression.Name(attr))
			}
		}
		exprBuilder = exprBuilder.WithProjection(projectionBuilder)
		hasExpression = true
	}

	if hasExpression {
		expr, err := exprBuilder.Build()
		if err != nil {
			return nil, fmt.Errorf("failed to build scan expression: %v", err)
		}
		if len(sb.FilterConditions) > 0 {
			input.FilterExpression = expr.Filter()
		}
		if len(sb.ProjectionAttributes) > 0 {
			input.ProjectionExpression = expr.Projection()
		}
		if expr.Names() != nil {
			input.ExpressionAttributeNames = expr.Names()
		}
		if expr.Values() != nil {
			input.ExpressionAttributeValues = expr.Values()
		}
	}

	if sb.LimitValue != nil {
		input.Limit = aws.Int32(int32(*sb.LimitValue))
	}
	if sb.ExclusiveStartKey != nil {
		input.ExclusiveStartKey = sb.ExclusiveStartKey
	}
	if sb.ParallelScanConfig != nil {
		input.Segment = aws.Int32(int32(sb.ParallelScanConfig.Segment))
		input.TotalSegments = aws.Int32(int32(sb.ParallelScanConfig.TotalSegments))
	}
	return input, nil
}

// Execute runs the scan against DynamoDB and returns strongly-typed results.
// Handles the complete scan lifecycle: build input, execute, unmarshal results.
// Returns all items that match the filter conditions as SchemaItem structs.
// Example: items, err := scanBuilder.Execute(ctx, dynamoClient)
func (sb *ScanBuilder) Execute(ctx context.Context, client *dynamodb.Client) ([]SchemaItem, error) {
	input, err := sb.BuildScan()
	if err != nil {
		return nil, err
	}

	result, err := client.Scan(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to execute scan: %v", err)
	}
	var items []SchemaItem
	err = attributevalue.UnmarshalListOfMaps(result.Items, &items)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal scan result: %v", err)
	}
	return items, nil
}

// ItemInput converts a SchemaItem to DynamoDB AttributeValue map format.
// Uses AWS SDK's attributevalue package for safe and consistent marshaling.
// The resulting map can be used in PutItem, UpdateItem, and other DynamoDB operations.
// Example: attrMap, err := ItemInput(userItem)
func ItemInput(item SchemaItem) (map[string]types.AttributeValue, error) {
	attributeValues, err := attributevalue.MarshalMap(item)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal item: %v", err)
	}
	return attributeValues, nil
}

// ItemsInput converts a slice of SchemaItems to DynamoDB AttributeValue maps.
// Efficiently marshals multiple items for batch operations like BatchWriteItem.
// Maintains order and provides detailed error context for debugging failed marshaling.
// Example: attrMaps, err := ItemsInput([]SchemaItem{item1, item2, item3})
func ItemsInput(items []SchemaItem) ([]map[string]types.AttributeValue, error) {
	result := make([]map[string]types.AttributeValue, 0, len(items))
	for i, item := range items {
		av, err := ItemInput(item)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal item at index %d: %v", i, err)
		}
		result = append(result, av)
	}
	return result, nil
}

// UpdateItemInput creates an UpdateItemInput from a complete SchemaItem.
// Automatically extracts the key and updates all non-key attributes.
// Use when you want to update an entire item with new values.
// Example: input, err := UpdateItemInput(modifiedUserItem)
func UpdateItemInput(item SchemaItem) (*dynamodb.UpdateItemInput, error) {
	key, err := KeyInput(item)
	if err != nil {
		return nil, fmt.Errorf("failed to create key from item for update: %v", err)
	}

	allAttributes, err := marshalItemToMap(item)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal item for update: %v", err)
	}

	updates := extractNonKeyAttributes(allAttributes)
	if len(updates) == 0 {
		return nil, fmt.Errorf("no non-key attributes to update")
	}

	updateExpression, attrNames, attrValues := buildUpdateExpression(updates)

	return &dynamodb.UpdateItemInput{
		TableName:                 aws.String(TableSchema.TableName),
		Key:                       key,
		UpdateExpression:          aws.String(updateExpression),
		ExpressionAttributeNames:  attrNames,
		ExpressionAttributeValues: attrValues,
	}, nil
}

// UpdateItemInputFromRaw creates an UpdateItemInput from raw key values and update map.
// More efficient for partial updates when you only want to modify specific attributes.
// Use when you know exactly which fields to update without loading the full item.
// Example: UpdateItemInputFromRaw("user123", nil, map[string]any{"status": "active", "last_login": time.Now()})
func UpdateItemInputFromRaw(hashKeyValue any, rangeKeyValue any, updates map[string]any) (*dynamodb.UpdateItemInput, error) {
	if err := validateKeyInputs(hashKeyValue, rangeKeyValue); err != nil {
		return nil, err
	}
	if err := validateUpdatesMap(updates); err != nil {
		return nil, err
	}

	key, err := KeyInputFromRaw(hashKeyValue, rangeKeyValue)
	if err != nil {
		return nil, fmt.Errorf("failed to create key for update: %v", err)
	}

	marshaledUpdates, err := marshalUpdatesWithSchema(updates)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal updates: %v", err)
	}

	updateExpression, attrNames, attrValues := buildUpdateExpression(marshaledUpdates)

	return &dynamodb.UpdateItemInput{
		TableName:                 aws.String(TableSchema.TableName),
		Key:                       key,
		UpdateExpression:          aws.String(updateExpression),
		ExpressionAttributeNames:  attrNames,
		ExpressionAttributeValues: attrValues,
	}, nil
}

// UpdateItemInputWithCondition creates a conditional UpdateItemInput.
// Updates the item only if the condition expression evaluates to true.
// Enables optimistic locking and prevents race conditions in concurrent updates.
// Example: UpdateItemInputWithCondition("user123", nil, updates, "version = :v", nil, map[string]types.AttributeValue{":v": &types.AttributeValueMemberN{Value: "1"}})
func UpdateItemInputWithCondition(hashKeyValue any, rangeKeyValue any, updates map[string]any, conditionExpression string, conditionAttributeNames map[string]string, conditionAttributeValues map[string]types.AttributeValue) (*dynamodb.UpdateItemInput, error) {
	if err := validateKeyInputs(hashKeyValue, rangeKeyValue); err != nil {
		return nil, err
	}
	if err := validateUpdatesMap(updates); err != nil {
		return nil, err
	}
	if err := validateConditionExpression(conditionExpression); err != nil {
		return nil, err
	}

	updateInput, err := UpdateItemInputFromRaw(hashKeyValue, rangeKeyValue, updates)
	if err != nil {
		return nil, err
	}

	updateInput.ConditionExpression = aws.String(conditionExpression)

	updateInput.ExpressionAttributeNames, updateInput.ExpressionAttributeValues = mergeExpressionAttributes(
		updateInput.ExpressionAttributeNames,
		updateInput.ExpressionAttributeValues,
		conditionAttributeNames,
		conditionAttributeValues,
	)

	return updateInput, nil
}

// UpdateItemInputWithExpression creates an UpdateItemInput using DynamoDB expression builders.
// Provides maximum flexibility for complex update operations (SET, ADD, REMOVE, DELETE).
// Use for advanced scenarios like atomic increments, list operations, or complex conditions.
// Example:
//
//	updateExpr := expression.Set(expression.Name("counter"), expression.Name("counter").Plus(expression.Value(1)))
//	condExpr := expression.Name("version").Equal(expression.Value(currentVersion))
//	input, err := UpdateItemInputWithExpression("user123", nil, updateExpr, &condExpr)
func UpdateItemInputWithExpression(hashKeyValue any, rangeKeyValue any, updateBuilder expression.UpdateBuilder, conditionBuilder *expression.ConditionBuilder) (*dynamodb.UpdateItemInput, error) {
	if err := validateKeyInputs(hashKeyValue, rangeKeyValue); err != nil {
		return nil, err
	}

	key, err := KeyInputFromRaw(hashKeyValue, rangeKeyValue)
	if err != nil {
		return nil, fmt.Errorf("failed to create key for expression update: %v", err)
	}

	var expr expression.Expression
	if conditionBuilder != nil {
		expr, err = expression.NewBuilder().
			WithUpdate(updateBuilder).
			WithCondition(*conditionBuilder).
			Build()
	} else {
		expr, err = expression.NewBuilder().
			WithUpdate(updateBuilder).
			Build()
	}

	if err != nil {
		return nil, fmt.Errorf("failed to build update expression: %v", err)
	}

	input := &dynamodb.UpdateItemInput{
		TableName:                 aws.String(TableSchema.TableName),
		Key:                       key,
		UpdateExpression:          expr.Update(),
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
	}
	if conditionBuilder != nil {
		input.ConditionExpression = expr.Condition()
	}
	return input, nil
}

// DeleteItemInput creates a DeleteItemInput from a complete SchemaItem.
// Extracts the primary key from the item for the delete operation.
// Use when you have the full item and want to delete it.
// Example: input, err := DeleteItemInput(userItem)
func DeleteItemInput(item SchemaItem) (*dynamodb.DeleteItemInput, error) {
	key, err := KeyInput(item)
	if err != nil {
		return nil, fmt.Errorf("failed to create key from item for delete: %v", err)
	}

	return &dynamodb.DeleteItemInput{
		TableName: aws.String(TableSchema.TableName),
		Key:       key,
	}, nil
}

// DeleteItemInputFromRaw creates a DeleteItemInput from raw key values.
// Use when you only have the key values and want to delete the item.
// More efficient than DeleteItemInput when you don't have the full item.
// Example: input, err := DeleteItemInputFromRaw("user123", "session456")
func DeleteItemInputFromRaw(hashKeyValue any, rangeKeyValue any) (*dynamodb.DeleteItemInput, error) {
	if err := validateKeyInputs(hashKeyValue, rangeKeyValue); err != nil {
		return nil, err
	}

	key, err := KeyInputFromRaw(hashKeyValue, rangeKeyValue)
	if err != nil {
		return nil, fmt.Errorf("failed to create key for delete: %v", err)
	}
	return &dynamodb.DeleteItemInput{
		TableName: aws.String(TableSchema.TableName),
		Key:       key,
	}, nil
}

// DeleteItemInputWithCondition creates a conditional DeleteItemInput.
// Deletes the item only if the condition expression evaluates to true.
// Prevents accidental deletion and enables optimistic locking patterns.
// Example: DeleteItemInputWithCondition("user123", nil, "attribute_exists(#status)", {"#status": "status"}, nil)
func DeleteItemInputWithCondition(hashKeyValue any, rangeKeyValue any, conditionExpression string, expressionAttributeNames map[string]string, expressionAttributeValues map[string]types.AttributeValue) (*dynamodb.DeleteItemInput, error) {
	if err := validateKeyInputs(hashKeyValue, rangeKeyValue); err != nil {
		return nil, err
	}
	if err := validateConditionExpression(conditionExpression); err != nil {
		return nil, err
	}

	key, err := KeyInputFromRaw(hashKeyValue, rangeKeyValue)
	if err != nil {
		return nil, fmt.Errorf("failed to create key for conditional delete: %v", err)
	}
	input := &dynamodb.DeleteItemInput{
		TableName:           aws.String(TableSchema.TableName),
		Key:                 key,
		ConditionExpression: aws.String(conditionExpression),
	}

	if expressionAttributeNames != nil {
		input.ExpressionAttributeNames = expressionAttributeNames
	}

	if expressionAttributeValues != nil {
		input.ExpressionAttributeValues = expressionAttributeValues
	}
	return input, nil
}

// BatchDeleteItemsInput creates a BatchWriteItemInput for deleting multiple items.
// Takes pre-built key maps and creates delete requests for batch operation.
// Limited to 25 items per batch due to DynamoDB constraints.
// Example: BatchDeleteItemsInput([]map[string]types.AttributeValue{key1, key2})
func BatchDeleteItemsInput(keys []map[string]types.AttributeValue) (*dynamodb.BatchWriteItemInput, error) {
	if err := validateBatchSize(len(keys), "delete"); err != nil {
		return nil, err
	}

	if len(keys) == 0 {
		return &dynamodb.BatchWriteItemInput{}, nil
	}
	writeRequests := make([]types.WriteRequest, 0, len(keys))
	for _, key := range keys {
		writeRequests = append(writeRequests, types.WriteRequest{
			DeleteRequest: &types.DeleteRequest{
				Key: key,
			},
		})
	}
	return &dynamodb.BatchWriteItemInput{
		RequestItems: map[string][]types.WriteRequest{
			TableSchema.TableName: writeRequests,
		},
	}, nil
}

// BatchDeleteItemsInputFromRaw creates a BatchWriteItemInput from SchemaItems.
// Extracts keys from each item and creates batch delete requests.
// More convenient than BatchDeleteItemsInput when you have full items.
// Example: BatchDeleteItemsInputFromRaw([]SchemaItem{item1, item2, item3})
func BatchDeleteItemsInputFromRaw(items []SchemaItem) (*dynamodb.BatchWriteItemInput, error) {
	if err := validateBatchSize(len(items), "delete"); err != nil {
		return nil, err
	}

	if len(items) == 0 {
		return &dynamodb.BatchWriteItemInput{}, nil
	}
	keys := make([]map[string]types.AttributeValue, 0, len(items))
	for _, item := range items {
		key, err := KeyInput(item)
		if err != nil {
			return nil, fmt.Errorf("failed to create key from item: %v", err)
		}
		keys = append(keys, key)
	}
	return BatchDeleteItemsInput(keys)
}

// KeyInput creates a DynamoDB key map from a SchemaItem with full validation.
// Extracts the primary key (hash + range) from the item and validates values.
// Use when you have a complete item and need to create a key for operations.
// Handles both simple (hash only) and composite (hash + range) keys automatically.
// Example: keyMap, err := KeyInput(userItem)
func KeyInput(item SchemaItem) (map[string]types.AttributeValue, error) {
	var hashKeyValue any

	hashKeyValue = item.Pk

	var rangeKeyValue any

	rangeKeyValue = item.Sk

	if err := validateKeyInputs(hashKeyValue, rangeKeyValue); err != nil {
		return nil, err
	}
	key := make(map[string]types.AttributeValue)

	hashKeyAV, err := attributevalue.Marshal(hashKeyValue)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal hash key: %v", err)
	}
	key[TableSchema.HashKey] = hashKeyAV

	if TableSchema.RangeKey != "" && rangeKeyValue != nil {
		rangeKeyAV, err := attributevalue.Marshal(rangeKeyValue)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal range key: %v", err)
		}
		key[TableSchema.RangeKey] = rangeKeyAV
	}
	return key, nil
}

// KeyInputFromRaw creates a DynamoDB key map from raw key values without validation.
// More efficient than KeyInput when you already have validated key values.
// Assumes validation has been done by the caller - use with caution.
// Handles both simple (hash only) and composite (hash + range) keys automatically.
// Example: keyMap, err := KeyInputFromRaw("user123", "session456")
func KeyInputFromRaw(hashKeyValue any, rangeKeyValue any) (map[string]types.AttributeValue, error) {
	key := make(map[string]types.AttributeValue)

	hashKeyAV, err := attributevalue.Marshal(hashKeyValue)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal hash key: %v", err)
	}
	key[TableSchema.HashKey] = hashKeyAV

	if TableSchema.RangeKey != "" && rangeKeyValue != nil {
		rangeKeyAV, err := attributevalue.Marshal(rangeKeyValue)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal range key: %v", err)
		}
		key[TableSchema.RangeKey] = rangeKeyAV
	}
	return key, nil
}

// IncrementAttribute atomically increments a numeric attribute by a specified value.
// Uses DynamoDB's ADD operation to ensure thread-safe increments without race conditions.
// Creates the attribute with the increment value if it doesn't exist.
// Example: IncrementAttribute("user123", nil, "view_count", 1)
func IncrementAttribute(hashKeyValue any, rangeKeyValue any, attributeName string, incrementValue int) (*dynamodb.UpdateItemInput, error) {
	if err := validateKeyInputs(hashKeyValue, rangeKeyValue); err != nil {
		return nil, err
	}
	if err := validateAttributeName(attributeName); err != nil {
		return nil, err
	}
	if err := validateIncrementValue(incrementValue); err != nil {
		return nil, err
	}

	key, err := KeyInputFromRaw(hashKeyValue, rangeKeyValue)
	if err != nil {
		return nil, fmt.Errorf("failed to create key for increment: %v", err)
	}
	return &dynamodb.UpdateItemInput{
		TableName:        aws.String(TableSchema.TableName),
		Key:              key,
		UpdateExpression: aws.String("ADD #attr :val"),
		ExpressionAttributeNames: map[string]string{
			"#attr": attributeName,
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":val": &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", incrementValue)},
		},
	}, nil
}

// AddToSet atomically adds values to a DynamoDB Set (SS or NS).
// Uses DynamoDB's ADD operation for sets - duplicate values are automatically ignored.
// Creates the set with provided values if the attribute doesn't exist.
// Supports string sets ([]string) and numeric sets ([]int, []float64, etc.).
// Example: AddToSet("user123", nil, "tags", []string{"premium", "verified"})
func AddToSet(hashKeyValue any, rangeKeyValue any, attributeName string, values any) (*dynamodb.UpdateItemInput, error) {
	if err := validateKeyInputs(hashKeyValue, rangeKeyValue); err != nil {
		return nil, err
	}
	if err := validateAttributeName(attributeName); err != nil {
		return nil, err
	}
	if err := validateSetValues(values); err != nil {
		return nil, err
	}

	key, err := KeyInputFromRaw(hashKeyValue, rangeKeyValue)
	if err != nil {
		return nil, fmt.Errorf("failed to create key for add to set: %v", err)
	}
	var attributeValue types.AttributeValue
	switch v := values.(type) {
	case []string:
		attributeValue = &types.AttributeValueMemberSS{Value: v}
	case []int:
		attributeValue = &types.AttributeValueMemberNS{Value: toIntStrings(v)}
	default:
		return nil, fmt.Errorf("unsupported type for set operation: %T, expected []string or numeric slice", values)
	}
	return &dynamodb.UpdateItemInput{
		TableName:        aws.String(TableSchema.TableName),
		Key:              key,
		UpdateExpression: aws.String("ADD #attr :val"),
		ExpressionAttributeNames: map[string]string{
			"#attr": attributeName,
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":val": attributeValue,
		},
	}, nil
}

// RemoveFromSet atomically removes values from a DynamoDB Set (SS or NS).
// Uses DynamoDB's DELETE operation for sets - non-existent values are ignored.
// If all values are removed, the attribute is deleted from the item.
// Supports string sets ([]string) and numeric sets ([]int, []float64, etc.).
// Example: RemoveFromSet("user123", nil, "tags", []string{"temporary"})
func RemoveFromSet(hashKeyValue any, rangeKeyValue any, attributeName string, values any) (*dynamodb.UpdateItemInput, error) {
	if err := validateKeyInputs(hashKeyValue, rangeKeyValue); err != nil {
		return nil, err
	}
	if err := validateAttributeName(attributeName); err != nil {
		return nil, err
	}
	if err := validateSetValues(values); err != nil {
		return nil, err
	}
	key, err := KeyInputFromRaw(hashKeyValue, rangeKeyValue)
	if err != nil {
		return nil, fmt.Errorf("failed to create key for remove from set: %v", err)
	}

	var attributeValue types.AttributeValue
	switch v := values.(type) {
	case []string:
		attributeValue = &types.AttributeValueMemberSS{Value: v}
	case []int:
		attributeValue = &types.AttributeValueMemberNS{Value: toIntStrings(v)}
	default:
		return nil, fmt.Errorf("unsupported type for set operation: %T, expected []string or numeric slice", values)
	}
	return &dynamodb.UpdateItemInput{
		TableName:        aws.String(TableSchema.TableName),
		Key:              key,
		UpdateExpression: aws.String("DELETE #attr :val"),
		ExpressionAttributeNames: map[string]string{
			"#attr": attributeName,
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":val": attributeValue,
		},
	}, nil
}

// ExtractFromDynamoDBStreamEvent extracts SchemaItem from DynamoDB stream event.
// Converts Lambda stream AttributeValues to DynamoDB SDK types for safe unmarshaling.
// Used for INSERT and MODIFY events to get the new item state.
// Example: item, err := ExtractFromDynamoDBStreamEvent(record)
func ExtractFromDynamoDBStreamEvent(dbEvent events.DynamoDBEventRecord) (*SchemaItem, error) {
	if dbEvent.Change.NewImage == nil {
		return nil, fmt.Errorf("new image is nil in the event")
	}

	dynamoAttrs := toDynamoMap(dbEvent.Change.NewImage)
	var item SchemaItem
	if err := attributevalue.UnmarshalMap(dynamoAttrs, &item); err != nil {
		return nil, fmt.Errorf("failed to unmarshal DynamoDB stream event: %v", err)
	}

	return &item, nil
}

// ExtractOldFromDynamoDBStreamEvent extracts old SchemaItem from DynamoDB stream event.
// Converts Lambda stream AttributeValues to DynamoDB SDK types for safe unmarshaling.
// Used for MODIFY and REMOVE events to get the previous item state.
// Example: oldItem, err := ExtractOldFromDynamoDBStreamEvent(record)
func ExtractOldFromDynamoDBStreamEvent(dbEvent events.DynamoDBEventRecord) (*SchemaItem, error) {
	if dbEvent.Change.OldImage == nil {
		return nil, fmt.Errorf("old image is nil in the event")
	}

	dynamoAttrs := toDynamoMap(dbEvent.Change.OldImage)
	var item SchemaItem
	if err := attributevalue.UnmarshalMap(dynamoAttrs, &item); err != nil {
		return nil, fmt.Errorf("failed to unmarshal old DynamoDB stream event: %v", err)
	}

	return &item, nil
}

// toDynamoMap converts Lambda events.DynamoDBAttributeValue to SDK types.AttributeValue.
// Required because Lambda and DynamoDB SDK use different attribute value types.
func toDynamoMap(streamAttrs map[string]events.DynamoDBAttributeValue) map[string]types.AttributeValue {
	dynamoAttrs := make(map[string]types.AttributeValue, len(streamAttrs))

	for key, streamAttr := range streamAttrs {
		dynamoAttrs[key] = toDynamoAttr(streamAttr)
	}
	return dynamoAttrs
}

// toDynamoAttr converts single Lambda AttributeValue to SDK AttributeValue.
// Handles all DynamoDB data types including nested Lists and Maps.
func toDynamoAttr(streamAttr events.DynamoDBAttributeValue) types.AttributeValue {
	switch streamAttr.DataType() {
	case events.DataTypeString:
		return &types.AttributeValueMemberS{Value: streamAttr.String()}
	case events.DataTypeNumber:
		return &types.AttributeValueMemberN{Value: streamAttr.Number()}
	case events.DataTypeBoolean:
		return &types.AttributeValueMemberBOOL{Value: streamAttr.Boolean()}
	case events.DataTypeStringSet:
		return &types.AttributeValueMemberSS{Value: streamAttr.StringSet()}
	case events.DataTypeNumberSet:
		return &types.AttributeValueMemberNS{Value: streamAttr.NumberSet()}
	case events.DataTypeBinarySet:
		return &types.AttributeValueMemberBS{Value: streamAttr.BinarySet()}
	case events.DataTypeBinary:
		return &types.AttributeValueMemberB{Value: streamAttr.Binary()}
	case events.DataTypeList:
		list := make([]types.AttributeValue, len(streamAttr.List()))
		for i, item := range streamAttr.List() {
			list[i] = toDynamoAttr(item)
		}
		return &types.AttributeValueMemberL{Value: list}
	case events.DataTypeMap:
		m := make(map[string]types.AttributeValue, len(streamAttr.Map()))
		for k, v := range streamAttr.Map() {
			m[k] = toDynamoAttr(v)
		}
		return &types.AttributeValueMemberM{Value: m}
	case events.DataTypeNull:
		return &types.AttributeValueMemberNULL{Value: true}
	default:
		return &types.AttributeValueMemberNULL{Value: true}
	}
}

// IsFieldModified checks if a specific field was modified in a MODIFY event.
// Compares old and new values to detect actual changes, not just updates.
// Returns false for INSERT/REMOVE events or if images are missing.
// Example: if IsFieldModified(record, "status") { ... }
func IsFieldModified(dbEvent events.DynamoDBEventRecord, fieldName string) bool {
	if dbEvent.EventName != "MODIFY" {
		return false
	}

	if dbEvent.Change.OldImage == nil || dbEvent.Change.NewImage == nil {
		return false
	}
	oldVal, oldExists := dbEvent.Change.OldImage[fieldName]
	newVal, newExists := dbEvent.Change.NewImage[fieldName]

	if !oldExists && newExists {
		return true
	}
	if oldExists && !newExists {
		return true
	}
	if oldExists && newExists {
		return !streamAttributeValuesEqual(oldVal, newVal)
	}
	return false
}

// streamAttributeValuesEqual compares two stream AttributeValues for equality.
// Handles all DynamoDB data types with proper set comparison for SS/NS.
func streamAttributeValuesEqual(a, b events.DynamoDBAttributeValue) bool {
	if a.DataType() != b.DataType() {
		return false
	}

	switch a.DataType() {
	case events.DataTypeString:
		return a.String() == b.String()
	case events.DataTypeNumber:
		return a.Number() == b.Number()
	case events.DataTypeBoolean:
		return a.Boolean() == b.Boolean()
	case events.DataTypeStringSet:
		aSet, bSet := a.StringSet(), b.StringSet()
		if len(aSet) != len(bSet) {
			return false
		}
		setMap := make(map[string]bool, len(aSet))
		for _, item := range aSet {
			setMap[item] = true
		}
		for _, item := range bSet {
			if !setMap[item] {
				return false
			}
		}
		return true
	case events.DataTypeNumberSet:
		aSet, bSet := a.NumberSet(), b.NumberSet()
		if len(aSet) != len(bSet) {
			return false
		}
		setMap := make(map[string]bool, len(aSet))
		for _, item := range aSet {
			setMap[item] = true
		}
		for _, item := range bSet {
			if !setMap[item] {
				return false
			}
		}
		return true
	case events.DataTypeNull:
		return true
	default:
		return false
	}
}

// GetBoolFieldChanged checks if a boolean field changed from false to true.
// Useful for detecting state transitions like activation flags.
// Example: if GetBoolFieldChanged(record, "is_verified") { sendWelcomeEmail() }
func GetBoolFieldChanged(dbEvent events.DynamoDBEventRecord, fieldName string) bool {
	if dbEvent.EventName != "MODIFY" {
		return false
	}

	if dbEvent.Change.OldImage == nil || dbEvent.Change.NewImage == nil {
		return false
	}
	oldValue := false
	if oldVal, ok := dbEvent.Change.OldImage[fieldName]; ok {
		oldValue = oldVal.Boolean()
	}
	newValue := false
	if newVal, ok := dbEvent.Change.NewImage[fieldName]; ok {
		newValue = newVal.Boolean()
	}
	return !oldValue && newValue
}

// ExtractBothFromDynamoDBStreamEvent extracts both old and new items from stream event.
// Returns nil for missing images (e.g., oldItem is nil for INSERT events).
// Useful for MODIFY events where you need to compare before/after states.
func ExtractBothFromDynamoDBStreamEvent(dbEvent events.DynamoDBEventRecord) (*SchemaItem, *SchemaItem, error) {
	var oldItem, newItem *SchemaItem
	var err error

	if dbEvent.Change.OldImage != nil {
		oldItem, err = ExtractOldFromDynamoDBStreamEvent(dbEvent)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to extract old item: %v", err)
		}
	}
	f dbEvent.Change.NewImage != nil {
		newItem, err = ExtractFromDynamoDBStreamEvent(dbEvent)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to extract new item: %v", err)
		}
	}

	return oldItem, newItem, nil
}

// CreateTriggerHandler creates a type-safe handler function for DynamoDB stream events.
// Provides callback-based event processing with automatic type conversion.
// Pass nil for events you don't want to handle.
// Example:
//
//	handler := CreateTriggerHandler(
//	    func(ctx context.Context, item *SchemaItem) error { /* INSERT */ },
//	    func(ctx context.Context, old, new *SchemaItem) error { /* MODIFY */ },
//	    func(ctx context.Context, keys map[string]events.DynamoDBAttributeValue) error { /* REMOVE */ },
//	)
func CreateTriggerHandler(
	onInsert func(context.Context, *SchemaItem) error,
	onModify func(context.Context, *SchemaItem, *SchemaItem) error,
	onDelete func(context.Context, map[string]events.DynamoDBAttributeValue) error,
) func(ctx context.Context, event events.DynamoDBEvent) error {
	return func(ctx context.Context, event events.DynamoDBEvent) error {
		for _, record := range event.Records {
			switch record.EventName {
			case "INSERT":
				if onInsert != nil {
					item, err := ExtractFromDynamoDBStreamEvent(record)
					if err != nil {
						return err
					}
					if err := onInsert(ctx, item); err != nil {
						return err
					}
				}

			case "MODIFY":
				if onModify != nil {
					oldItem, newItem, err := ExtractBothFromDynamoDBStreamEvent(record)
					if err != nil {
						return err
					}

					if err := onModify(ctx, oldItem, newItem); err != nil {
						return err
					}
				}

			case "REMOVE":
				if onDelete != nil {
					if err := onDelete(ctx, record.Change.OldImage); err != nil {
						return err
					}
				}
			}
		}
		return nil
	}
}

// MarshalMap converts any Go value (map, struct, etc.) to DynamoDB AttributeValue map
// Uses AWS SDK's built-in marshaler for consistent behavior
func MarshalMap(input any) (map[string]types.AttributeValue, error) {
	result, err := attributevalue.MarshalMap(input)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal to AttributeValue map: %v", err)
	}

	return result, nil
}

// Marshal converts a single Go value to DynamoDB AttributeValue
// Uses AWS SDK's built-in marshaler for consistent behavior
func Marshal(input any) (types.AttributeValue, error) {
	result, err := attributevalue.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal to AttributeValue: %v", err)
	}

	return result, nil
}

// Generic type constraints for numeric types used in DynamoDB sets.
// Provides compile-time type safety for numeric conversions.
type Signed interface {
	~int | ~int8 | ~int16 | ~int32 | ~int64
}

type Unsigned interface {
	~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64
}

type Float interface {
	~float32 | ~float64
}

// toIntStrings converts any signed or unsigned integer slice to string slice.
// DynamoDB requires numeric sets as string arrays for the wire protocol.
// Example: toIntStrings([]int{1, 2, 3}) -> ["1", "2", "3"]
func toIntStrings[T Signed | Unsigned](nums []T) []string {
	out := make([]string, len(nums))
	for i, n := range nums {
		out[i] = strconv.FormatInt(int64(n), 10)
	}
	return out
}

// toFloatStrings converts any float slice to string slice.
// Uses 'g' format for optimal precision and readability.
// Example: toFloatStrings([]float64{1.5, 2.7}) -> ["1.5", "2.7"]
func toFloatStrings[F Float](nums []F) []string {
	out := make([]string, len(nums))
	for i, f := range nums {
		out[i] = strconv.FormatFloat(float64(f), 'g', -1, 64)
	}
	return out
}

// marshalItemToMap converts SchemaItem to AttributeValue map for DynamoDB operations.
// Internal helper that uses AWS SDK's attributevalue package for safe marshaling.
func marshalItemToMap(item SchemaItem) (map[string]types.AttributeValue, error) {
	return attributevalue.MarshalMap(item)
}

// extractNonKeyAttributes filters out primary key attributes from the attribute map.
// Used in update operations where key attributes cannot be modified.
// Returns only non-key attributes for SET/ADD/REMOVE expressions.
func extractNonKeyAttributes(allAttributes map[string]types.AttributeValue) map[string]types.AttributeValue {
	updates := make(map[string]types.AttributeValue, len(allAttributes)-2)

	for attrName, attrValue := range allAttributes {
		if attrName != TableSchema.HashKey && attrName != TableSchema.RangeKey {
			updates[attrName] = attrValue
		}
	}

	return updates
}

// buildUpdateExpression creates SET expression from attribute map.
// Generates safe attribute names and values to avoid DynamoDB reserved words.
// Returns expression string, name mappings, and value mappings.
// Example: "SET #attr0 = :val0, #attr1 = :val1"
func buildUpdateExpression(updates map[string]types.AttributeValue) (string, map[string]string, map[string]types.AttributeValue) {
	if len(updates) == 0 {
		return "", nil, nil
	}

	updateParts := make([]string, 0, len(updates))
	attrNames := make(map[string]string, len(updates))
	attrValues := make(map[string]types.AttributeValue, len(updates))

	i := 0
	for attrName, attrValue := range updates {
		nameKey := fmt.Sprintf("#attr%d", i)
		valueKey := fmt.Sprintf(":val%d", i)

		updateParts = append(updateParts, fmt.Sprintf("%s = %s", nameKey, valueKey))
		attrNames[nameKey] = attrName
		attrValues[valueKey] = attrValue
		i++
	}
	return "SET " + strings.Join(updateParts, ", "), attrNames, attrValues
}

// mergeExpressionAttributes merges condition attributes into existing expression maps.
// Safely combines update expression attributes with filter condition attributes.
// Prevents conflicts between update and condition expression mappings.
func mergeExpressionAttributes(
	baseNames map[string]string,
	baseValues map[string]types.AttributeValue,
	conditionNames map[string]string,
	conditionValues map[string]types.AttributeValue,
) (map[string]string, map[string]types.AttributeValue) {
	if conditionNames != nil {
		for key, value := range conditionNames {
			baseNames[key] = value
		}
	}

	if conditionValues != nil {
		for key, value := range conditionValues {
			baseValues[key] = value
		}
	}
	return baseNames, baseValues
}

// marshalUpdatesWithSchema marshals updates map using schema type information.
// Provides type-safe marshaling by consulting the table schema for field types.
// Handles special DynamoDB types (Sets) that require custom marshaling logic.
func marshalUpdatesWithSchema(updates map[string]any) (map[string]types.AttributeValue, error) {
	result := make(map[string]types.AttributeValue, len(updates))

	for fieldName, value := range updates {
		if fieldInfo, exists := TableSchema.FieldsMap[fieldName]; exists {
			av, err := marshalValueByType(value, fieldInfo.DynamoType)
			if err != nil {
				return nil, fmt.Errorf("failed to marshal field %s: %v", fieldName, err)
			}
			result[fieldName] = av
		} else {
			av, err := attributevalue.Marshal(value)
			if err != nil {
				return nil, fmt.Errorf("failed to marshal field %s: %v", fieldName, err)
			}
			result[fieldName] = av
		}
	}
	return result, nil
}

// marshalValueByType marshals value according to specific DynamoDB type.
// Handles special cases like String Sets (SS) and Number Sets (NS) that require
// custom marshaling logic not provided by the default AWS SDK marshaler.
// Example: marshalValueByType([]int{1,2,3}, "NS") -> AttributeValueMemberNS
func marshalValueByType(value any, dynamoType string) (types.AttributeValue, error) {
	switch dynamoType {
	case "SS":
		ss, ok := value.([]string)
		if !ok {
			return nil, fmt.Errorf("SS: expected []string, got %T", value)
		}
		return &types.AttributeValueMemberSS{Value: ss}, nil
	case "NS":
		switch v := value.(type) {
		case []int:
			return &types.AttributeValueMemberNS{Value: toIntStrings(v)}, nil
		default:
			return nil, fmt.Errorf("NS: expected numeric slice, got %T", value)
		}
	default:
		return attributevalue.Marshal(value)
	}
}

// validateKeyPart checks if key part (hash or range) value is valid for DynamoDB.
// Hash keys are required and cannot be nil/empty, range keys are optional.
// Supports string, numeric types commonly used as DynamoDB keys.
func validateKeyPart(partName string, value any) error {
	if value == nil {
		if partName == "hash" {
			return fmt.Errorf("hash key cannot be nil")
		}
		return nil
	}

	switch v := value.(type) {
	case string:
		if v == "" && partName == "hash" {
			return fmt.Errorf("hash key string cannot be empty")
		}
	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
	case float32, float64:
	default:
		return fmt.Errorf("unsupported %s key type: %T", partName, value)
	}
	return nil
}

// validateHashKey checks if hash key value is valid for DynamoDB operations.
// Hash key is required for all DynamoDB operations and cannot be nil or empty.
// Example: validateHashKey("user123") -> nil, validateHashKey("") -> error
func validateHashKey(value any) error {
	return validateKeyPart("hash", value)
}

// validateRangeKey checks if range key value is valid (nil is allowed).
// Range key is optional - tables can have simple (hash only) or composite keys.
// Example: validateRangeKey(nil) -> nil, validateRangeKey("timestamp") -> nil
func validateRangeKey(value any) error {
	return validateKeyPart("range", value)
}

// validateAttributeName checks if attribute name meets DynamoDB requirements.
// DynamoDB limits: non-empty, max 255 characters.
// Used to prevent API errors from invalid attribute names.
func validateAttributeName(name string) error {
	if name == "" {
		return fmt.Errorf("attribute name cannot be empty")
	}

	if len(name) > 255 {
		return fmt.Errorf("attribute name too long: %d chars (max 255)", len(name))
	}
	return nil
}

// validateUpdatesMap checks if updates map is valid for UpdateItem operations.
// Ensures non-empty map with valid attribute names and non-nil values.
// Prevents wasted API calls and provides clear error messages.
func validateUpdatesMap(updates map[string]any) error {
	if len(updates) == 0 {
		return fmt.Errorf("updates map cannot be empty")
	}

	for attrName, value := range updates {
		if err := validateAttributeName(attrName); err != nil {
			return fmt.Errorf("invalid attribute name '%s': %v", attrName, err)
		}

		if value == nil {
			return fmt.Errorf("update value for '%s' cannot be nil", attrName)
		}
	}
	return nil
}

// validateBatchSize checks if batch size is within DynamoDB limits.
// DynamoDB batch operations (BatchGetItem, BatchWriteItem) have a 25 item limit.
// Prevents API errors and guides proper batch partitioning.
// Example: validateBatchSize(30, "write") -> error about exceeding limit
func validateBatchSize(size int, operation string) error {
	if size == 0 {
		return fmt.Errorf("%s batch cannot be empty", operation)
	}

	if size > 25 {
		return fmt.Errorf("%s batch size %d exceeds DynamoDB limit of 25", operation, size)
	}
	return nil
}

// validateSetValues checks if set values are valid for AddToSet/RemoveFromSet operations.
// DynamoDB sets cannot be empty and string sets cannot contain empty strings.
// Validates both string sets (SS) and numeric sets (NS) with proper type checking.
func validateSetValues(values any) error {
	if values == nil {
		return fmt.Errorf("set values cannot be nil")
	}

	switch v := values.(type) {
	case []string:
		if len(v) == 0 {
			return fmt.Errorf("string set cannot be empty")
		}
		for i, str := range v {
			if str == "" {
				return fmt.Errorf("string set item %d cannot be empty", i)
			}
		}
	case []int, []int8, []int16, []int32, []int64, []uint, []uint8, []uint16, []uint32, []uint64, []float32, []float64:
		rv := reflect.ValueOf(v)
		if rv.Len() == 0 {
			return fmt.Errorf("number set cannot be empty")
		}
	default:
		return fmt.Errorf("unsupported set type: %T, expected []string or numeric slice", values)
	}
	return nil
}

// validateConditionExpression checks if condition expression meets DynamoDB limits.
// DynamoDB condition expressions have a 4KB size limit.
// Helps prevent API errors from oversized expressions.
func validateConditionExpression(expr string) error {
	if expr == "" {
		return fmt.Errorf("condition expression cannot be empty")
	}

	if len(expr) > 4096 {
		return fmt.Errorf("condition expression too long: %d chars (max 4096)", len(expr))
	}
	return nil
}

// validateIncrementValue checks if increment value is valid for atomic operations.
// DynamoDB ADD operation accepts any integer value (positive or negative).
// Function maintained for API consistency and future validation needs.
func validateIncrementValue(value int) error {
	// DynamoDB supports any int value for ADD operation
	// No specific validation needed, but we keep the function for consistency
	return nil
}

// validateKeyInputs validates both hash and range key inputs for DynamoDB operations.
// Comprehensive validation for all key-based operations (GetItem, UpdateItem, etc.).
// Provides clear error context for debugging key-related issues.
// Example: validateKeyInputs("user123", "2023-01-01") -> nil
func validateKeyInputs(hashKeyValue, rangeKeyValue any) error {
	if err := validateHashKey(hashKeyValue); err != nil {
		return fmt.Errorf("invalid hash key: %v", err)
	}

	if err := validateRangeKey(rangeKeyValue); err != nil {
		return fmt.Errorf("invalid range key: %v", err)
	}
	return nil
}
