package service

type ListQuery struct {
	PageOffset int
	NumRows    int
	Search     string
	SortBy     string
	SortDir    string
}
