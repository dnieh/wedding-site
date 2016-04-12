package main

import (
	"html/template"
	"net/http"
)

type Page struct {
	PlaceholderText string
}

func setHeader(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "text/html")
}

func handleError(w http.ResponseWriter, err error) {
	http.Error(w, err.Error(), http.StatusInternalServerError)
}

func handler(w http.ResponseWriter, r *http.Request) {
	setHeader(w)
	p := &Page{PlaceholderText: "Coming Soon"}
	t, err := template.ParseFiles("/home/dnieh/projects/bin/index.html")
	if err != nil {
		handleError(w, err)
		return
	}
	t.Execute(w, p)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	setHeader(w)
	p := &Page{PlaceholderText: "Coming Soon"}
	t, err := template.ParseFiles("/home/dnieh/projects/bin/login.html")
	if err != nil {
		handleError(w, err)
		return
	}
	t.Execute(w, p)
}

func adminHandler(w http.ResponseWriter, r *http.Request) {
	setHeader(w)
	p := &Page{PlaceholderText: "Coming Soon"}
	t, err := template.ParseFiles("/home/dnieh/projects/admin.html")
	if err != nil {
		handleError(w, err)
		return
	}
	t.Execute(w, p)
}

func rsvpHandler(w http.ResponseWriter, r *http.Request) {
	// fmt.Fprintf(w, "rsvp endpoint hit")
}

func main() {
	http.HandleFunc("/", handler)
	http.HandleFunc("/login", loginHandler)
	http.HandleFunc("/admin", adminHandler)
	http.HandleFunc("/rsvp", rsvpHandler)
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("/home/dnieh/projects/bin/css"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("/home/dnieh/projects/bin/js"))))
	http.ListenAndServe(":2009", nil)
}
