module.exports = class User{
    constructor({id, fullname, lastName, phoneNumber, email}){
        this.id = id;
        this.fullname = fullname;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
    }

    static fromJson(json){
        return new User({
            id: json['id'],
            email: json['email'],
            phoneNumber: json['phone_number'],
            email: json['email'],
            fullname: json['fullname'],
        });
    }

    static fromDocToJson(doc){
        let data = doc.data();
        return {
            uid: doc.id,
            email: data['email'],
            phoneNumber: data['phonenumber'],
            fullname: data['fullname'],
        }
    }
}

