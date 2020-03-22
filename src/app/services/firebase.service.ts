import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  private dbCollection: AngularFirestoreCollection;
  constructor(private afs: AngularFirestore) {
    this.dbCollection = this.afs.collection('polylines');
  }

  addPolyline(data) {
    return this.dbCollection.add({data});
  }

  getPolylinesData() {
    // this will filter and extract id and then wrap a complete {data, id} object
    return this.dbCollection.snapshotChanges().pipe(
      map(snapshots => snapshots.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    // this will just give data object
    // return this.dbCollection.valueChanges();
  }

  deletePolyline(key) {
    return this.dbCollection.doc(key).delete();
  }

  // update(key, value) {
  //   value.nameToSearch = value.name.toLowerCase();
  //   return this.dbCollection('users').doc(key).set(value);
  // }

  // searchUsersByAge(value) {
  //   return this.afs.collection('users', ref => ref
  //     .orderBy('age').startAt(value)).snapshotChanges();
  // }
  //
  // searchUsers(searchValue) {
  //   return this.afs.collection('users', ref => ref
  //     .where('nameToSearch', '>=', searchValue)
  //     .where('nameToSearch', '<=', searchValue + '\uf8ff'))
  //     .snapshotChanges();
  // }
}

