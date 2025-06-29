items, err := userprofiles.NewQueryBuilder().
	WithEQ("user_id", "user123").
	FilterGT("age", 18).
	FilterEQ("is_active", true).
	OrderByDesc().
	Limit(10).
	Execute(ctx, client)
if err != nil {
	log.Fatal(err)
}

for _, user := range items {
	fmt.Printf("User: %s, Age: %d\n", user.Email, user.Age)
}