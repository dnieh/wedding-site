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

func handler(w http.ResponseWriter, r *http.Request) {
	setHeader(w)
	p := &Page{PlaceholderText: "Coming Soon"}
	t, _ := template.ParseFiles("video-only.html")
	t.Execute(w, p)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	setHeader(w)
	p := &Page{PlaceholderText: "Coming Soon"}
	t, _ := template.ParseFiles("login.html")
	t.Execute(w, p)
}

func adminHandler(w http.ResponseWriter, r *http.Request) {
	setHeader(w)
	p := &Page{PlaceholderText: "Coming Soon"}
	t, _ := template.ParseFiles("admin.html")
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
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("css"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("js"))))
	http.ListenAndServe(":2009", nil)
}
